import { TRPCError } from "@trpc/server";
import { and, eq, isNotNull, sql } from "drizzle-orm";
import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminRouter } from "./adminRouter";
import { adminAuthRouter } from "./adminAuth";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { sendOtpEmail, sendOtpSms, storeOtp, verifyOtp } from "./emailOtp";
import { getFiatRates, getLiveMarketPrices } from "./marketData";
import { investmentCreationSchema, kycSubmissionSchema, metadataSchema, profileUpdateSchema, safeText } from "./validation";
import {
  listUserSessions,
  revokeOtherUserSessions,
  revokeSessionByToken,
  revokeUserSession,
} from "./userSessions";
import { getPlatformSettings } from "./platformSettings";
import { getReferralDashboard } from "./referrals";
import { advancedRouter, dispatchWebhook, monitorTransaction } from "./advancedModules";
import { trustedWithdrawalIps } from "../drizzle/schema";
import { getClientIp } from "./loginRateLimit";
import { userTwoFactorRouter, verifyUserSecondFactor } from "./userTwoFactor";
import { hashPassword } from "./adminAuth";
import { aiCopilotRouter } from "./aiCopilot";
import {
  clearAllNotifications, claimChallengeReward, createAddressBookEntry,
  createMintingRecord, createNfcCard, createNotification, createPriceAlert,
  createSocialPost, createTransaction, deleteAddressBookEntry, deletePriceAlert,
  getActiveChallenges, getCommunityFeed, getLeaderboard, getUserAddressBook,
  getUserById, getUserChallengeProgress, getUserMintingHistory, getUserNfcCards,
  getUserNotifications, getUserPriceAlerts, getUserTransactions, getUserWallets,
  initDefaultWallets, markAllNotificationsRead, markNotificationRead, sendChatMessage,
  toggle2FA, updateAddressBookEntry, updateNfcCard, updateNotifPrefs, updateUserGoldCoins,
  updateUserProfile, upsertUser,
} from "./db";

const positiveAmountString = z
  .string()
  .trim()
  .regex(/^\d+(?:\.\d{1,8})?$/, "Enter a valid amount")
  .refine((value) => Number(value) > 0, "Amount must be greater than zero");
const nonNegativeAmountString = z
  .string()
  .trim()
  .regex(/^\d+(?:\.\d{1,8})?$/, "Enter a valid amount");
const assetSymbol = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z0-9]{2,16}$/, "Unsupported currency format");

export const appRouter = router({
  system: systemRouter,
  advanced: advancedRouter,
  ai: aiCopilotRouter,
  twoFactor: userTwoFactorRouter,
  market: router({
    prices: publicProcedure.query(async () => getLiveMarketPrices()),
    fiatRates: publicProcedure.query(async () => getFiatRates()),
  }),
  platform: router({
    depositAddresses: protectedProcedure.query(async () => {
      const settings = await getPlatformSettings();
      return settings.depositAddresses;
    }),
  }),
  admin: adminRouter,
  adminAuth: adminAuthRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(async ({ ctx }) => {
      const token = (ctx.req as typeof ctx.req & { cookies?: Record<string, string> }).cookies?.[COOKIE_NAME];
      if (token) await revokeSessionByToken(token);
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  session: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const token = (ctx.req as typeof ctx.req & { cookies?: Record<string, string> }).cookies?.[COOKIE_NAME];
      return listUserSessions(ctx.user.id, token);
    }),
    revoke: protectedProcedure
      .input(z.object({ sessionId: z.string().uuid() }))
      .mutation(async ({ ctx, input }) => {
        await revokeUserSession(ctx.user.id, input.sessionId);
        return { success: true };
      }),
    revokeOthers: protectedProcedure.mutation(async ({ ctx }) => {
      const token = (ctx.req as typeof ctx.req & { cookies?: Record<string, string> }).cookies?.[COOKIE_NAME];
      if (!token) throw new TRPCError({ code: "UNAUTHORIZED" });
      await revokeOtherUserSessions(ctx.user.id, token);
      return { success: true };
    }),
  }),
  user: router({
    profile: protectedProcedure.query(async ({ ctx }) => {
      const user = await getUserById(ctx.user.id);
      if (!user) throw new TRPCError({ code: "NOT_FOUND" });
      return user;
    }),
    updateProfile: protectedProcedure
      .input(profileUpdateSchema)
      .mutation(async ({ ctx, input }) => {
        await updateUserProfile(ctx.user.id, input);
        return { success: true };
      }),
    updateNotifPrefs: protectedProcedure
      .input(z.object({
        priceAlerts: z.boolean().optional(),
        portfolioUpdates: z.boolean().optional(),
        newsDigest: z.boolean().optional(),
        securityAlerts: z.boolean().optional(),
        marketingEmails: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await updateNotifPrefs(ctx.user.id, input);
        return { success: true };
      }),
    toggle2FA: protectedProcedure
      .input(z.object({ enabled: z.boolean() }))
      .mutation(async ({ ctx, input }) => {
        await toggle2FA(ctx.user.id, input.enabled);
        return { success: true };
      }),
    submitKyc: protectedProcedure
      .input(kycSubmissionSchema)
      .mutation(async ({ ctx, input }) => {
        const { submitKycDocuments } = await import("./db");
        await submitKycDocuments(ctx.user.id, {
          documentType: input.documentType,
          documentFrontUrl: input.documentFrontUrl,
          documentBackUrl: input.documentBackUrl,
          selfieUrl: input.selfieUrl,
          proofOfAddressUrl: input.proofOfAddressUrl,
        });
        await createNotification({
          userId: ctx.user.id, type: "system",
          title: "KYC Verification Submitted",
          body: "Your identity documents have been submitted. We'll review them within 24 hours.",
          icon: "shield",
        });
        return { success: true };
      }),
    kycDocuments: protectedProcedure.query(async ({ ctx }) => {
      const { getUserKycDocuments } = await import("./db");
      return getUserKycDocuments(ctx.user.id);
    }),
    leaderboard: publicProcedure
      .input(z.object({ limit: z.number().min(1).max(100).default(20) }))
      .query(async ({ input }) => getLeaderboard(input.limit)),
  }),
  referral: router({
    dashboard: protectedProcedure.query(({ ctx }) => getReferralDashboard(ctx.user.id)),
  }),
  wallet: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      await initDefaultWallets(ctx.user.id);
      return getUserWallets(ctx.user.id);
    }),
    goldCoins: protectedProcedure.query(async ({ ctx }) => {
      const user = await getUserById(ctx.user.id);
      return { goldCoins: user?.goldCoins ?? 0 };
    }),
  }),
  transaction: router({
    list: protectedProcedure
      .input(z.object({ limit: z.number().min(1).max(200).default(50) }))
      .query(async ({ ctx, input }) => getUserTransactions(ctx.user.id, input.limit)),
    sendBtc: protectedProcedure
      .input(z.object({
        toAddress: z.string().min(26).max(62),
        amount: positiveAmountString,
        network: z.enum(["mainnet", "testnet", "lightning"]).default("mainnet"),
        note: safeText(0, 256).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const txHash = "0x" + Math.random().toString(16).slice(2) + Math.random().toString(16).slice(2);
        await createTransaction({
          userId: ctx.user.id, type: "send", currency: "BTC",
          amount: input.amount, fee: "0.00001", status: "pending",
          toAddress: input.toAddress, txHash, network: input.network, note: input.note,
        });
        await createNotification({
          userId: ctx.user.id, type: "transaction", title: "BTC Sent",
          body: input.amount + " BTC sent to " + input.toAddress.slice(0, 8) + "...",
          icon: "bitcoin", actionLabel: "View",
        });
        return { success: true, txHash };
      }),
    sendGoldCoins: protectedProcedure
      .input(z.object({
        toUserId: z.number(), amount: z.number().min(1),
        note: z.string().max(256).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const sender = await getUserById(ctx.user.id);
        if (!sender || sender.goldCoins < input.amount)
          throw new TRPCError({ code: "BAD_REQUEST", message: "Insufficient GoldCoins" });
        await updateUserGoldCoins(ctx.user.id, -input.amount);
        await updateUserGoldCoins(input.toUserId, input.amount);
        await createTransaction({
          userId: ctx.user.id, type: "goldcoin_transfer", currency: "GLD_COIN",
          amount: String(input.amount), status: "confirmed",
          toUserId: input.toUserId, note: input.note,
        });
        await createNotification({
          userId: input.toUserId, type: "message", title: "GoldCoins Received!",
          body: "You received " + input.amount + " GoldCoins" + (input.note ? ": \"" + input.note + "\"" : ""),
          icon: "coins", actionLabel: "View Wallet",
        });
        return { success: true };
      }),
    requestDeposit: protectedProcedure
      .input(z.object({
        method: z.enum(["crypto", "bank_transfer", "card", "mobile_money"]),
        currency: assetSymbol,
        amount: positiveAmountString,
        network: z.string().trim().min(1).max(32).optional(),
        metadata: metadataSchema.optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const txHash = "DEP-" + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 6).toUpperCase();
        await createTransaction({
          userId: ctx.user.id, type: "deposit", currency: input.currency,
          amount: input.amount, fee: "0", status: "pending",
          network: input.network, txHash, note: `Deposit via ${input.method}`,
          metadata: { method: input.method, ...input.metadata } as any,
        });
        await createNotification({
          userId: ctx.user.id, type: "transaction", title: "Deposit Request Submitted",
          body: `Your ${input.currency} deposit of ${input.amount} via ${input.method.replace("_", " ")} is being processed.`,
          icon: "arrow-down", actionLabel: "View",
        });
        void dispatchWebhook("deposit.created", { userId: ctx.user.id, txHash, currency: input.currency, amount: input.amount });
        return { success: true, txHash };
      }),
    requestWithdrawal: protectedProcedure
      .input(z.object({
        method: z.enum(["crypto", "bank_wire", "card_payout", "mobile_money"]),
        currency: assetSymbol,
        amount: positiveAmountString,
        fee: nonNegativeAmountString.optional(),
        destination: z.string().trim().min(3).max(512),
        twoFactorCode: z.string().min(6).max(32).optional(),
        network: z.string().trim().min(1).max(32).optional(),
        metadata: metadataSchema.optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await verifyUserSecondFactor(ctx.user.id, input.twoFactorCode);
        const txHash = "WDR-" + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 6).toUpperCase();
        const { getDb } = await import("./db");
        const db = await getDb();
        const clientIp = getClientIp(ctx.req);
        const [trustedIp] = db ? await db.select({ id: trustedWithdrawalIps.id }).from(trustedWithdrawalIps).where(and(eq(trustedWithdrawalIps.userId, ctx.user.id), eq(trustedWithdrawalIps.ipAddress, clientIp), isNotNull(trustedWithdrawalIps.verifiedAt))).limit(1) : [];
        const holdUntil = trustedIp ? null : new Date(Date.now() + 24 * 60 * 60_000).toISOString();
        await createTransaction({
          userId: ctx.user.id, type: "withdrawal", currency: input.currency,
          amount: input.amount, fee: input.fee || "0", status: "pending",
          toAddress: input.destination, network: input.network, txHash,
          note: `Withdrawal via ${input.method}`,
          metadata: { method: input.method, sourceIp: clientIp, holdUntil, requiresIpReview: !trustedIp, ...input.metadata } as any,
        });
        await createNotification({
          userId: ctx.user.id, type: "transaction", title: "Withdrawal Request Submitted",
          body: `Your ${input.currency} withdrawal of ${input.amount} via ${input.method.replace("_", " ")} is pending approval.`,
          icon: "arrow-up", actionLabel: "View",
        });
        const alerts = await monitorTransaction({ userId: ctx.user.id, type: "withdrawal", amount: Number(input.amount), currency: input.currency });
        if (alerts.some((alert) => alert.rule === "large_transaction")) {
          void dispatchWebhook("withdrawal.large", { userId: ctx.user.id, txHash, amount: input.amount, currency: input.currency, alerts: alerts.length });
        }
        return { success: true, txHash, holdUntil };
      }),
  }),
  addressBook: router({
    list: protectedProcedure.query(async ({ ctx }) => getUserAddressBook(ctx.user.id)),
    create: protectedProcedure
      .input(z.object({
        label: safeText(1, 128), address: z.string().trim().min(26).max(256),
        currency: assetSymbol.default("BTC"),
        tag: z.enum(["exchange", "hardware_wallet", "cold_storage", "friend", "business", "other"]).default("other"),
        isFavorite: z.boolean().default(false),
      }))
      .mutation(async ({ ctx, input }) => {
        await createAddressBookEntry({ ...input, userId: ctx.user.id });
        return { success: true };
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        label: safeText(1, 128).optional(),
        tag: z.enum(["exchange", "hardware_wallet", "cold_storage", "friend", "business", "other"]).optional(),
        isFavorite: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;
        await updateAddressBookEntry(id, ctx.user.id, data);
        return { success: true };
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await deleteAddressBookEntry(input.id, ctx.user.id);
        return { success: true };
      }),
  }),
  notification: router({
    list: protectedProcedure
      .input(z.object({ limit: z.number().default(50) }))
      .query(async ({ ctx, input }) => getUserNotifications(ctx.user.id, input.limit)),
    markRead: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await markNotificationRead(input.id, ctx.user.id);
        return { success: true };
      }),
    markAllRead: protectedProcedure.mutation(async ({ ctx }) => {
      await markAllNotificationsRead(ctx.user.id);
      return { success: true };
    }),
    clearAll: protectedProcedure.mutation(async ({ ctx }) => {
      await clearAllNotifications(ctx.user.id);
      return { success: true };
    }),
  }),
  challenge: router({
    list: publicProcedure.query(() => getActiveChallenges()),
    myProgress: protectedProcedure.query(async ({ ctx }) => getUserChallengeProgress(ctx.user.id)),
    claim: protectedProcedure
      .input(z.object({ challengeId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const result = await claimChallengeReward(ctx.user.id, input.challengeId);
        if (!result) throw new TRPCError({ code: "BAD_REQUEST", message: "Challenge not claimable" });
        await createNotification({
          userId: ctx.user.id, type: "challenge", title: "Challenge Reward Claimed!",
          body: "You earned " + result.reward + " GoldCoins! New balance: " + result.newBalance,
          icon: "trophy", actionLabel: "View Challenges",
        });
        return result;
      }),
  }),
  social: router({
    feed: publicProcedure
      .input(z.object({ limit: z.number().default(30) }))
      .query(async ({ input }) => getCommunityFeed(input.limit)),
    post: protectedProcedure
      .input(z.object({
        content: safeText(1, 2000).optional(),
        mediaUrl: z.string().url().optional(),
        mediaType: z.enum(["image", "video", "none"]).default("none"),
        platform: z.string().max(32).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await createSocialPost({ ...input, userId: ctx.user.id, goldCoinsEarned: 10 });
        await updateUserGoldCoins(ctx.user.id, 10);
        return { success: true, coinsEarned: 10 };
      }),
    sendMessage: protectedProcedure
      .input(z.object({
        toUserId: z.number(),
        content: safeText(1, 2000).optional(),
        mediaUrl: z.string().url().optional(),
        mediaType: z.enum(["text", "image", "video", "goldcoin"]).default("text"),
      }))
      .mutation(async ({ ctx, input }) => {
        await sendChatMessage({ ...input, fromUserId: ctx.user.id });
        await createNotification({
          userId: input.toUserId, type: "message", title: "New Message",
          body: (input.content ?? "Sent you a message").slice(0, 100),
          icon: "message", actionLabel: "Reply",
        });
        return { success: true };
      }),
  }),
  minting: router({
    history: protectedProcedure.query(async ({ ctx }) => getUserMintingHistory(ctx.user.id)),
    mint: protectedProcedure
      .input(z.object({
        tier: z.enum(["micro", "standard", "premium", "vault"]),
        weightGrams: z.number(), goldCoinsUsed: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const user = await getUserById(ctx.user.id);
        if (!user || user.goldCoins < input.goldCoinsUsed)
          throw new TRPCError({ code: "BAD_REQUEST", message: "Insufficient GoldCoins" });
        const txHash = "GV" + Date.now().toString(16).toUpperCase();
        await updateUserGoldCoins(ctx.user.id, -input.goldCoinsUsed);
        await createMintingRecord({
          userId: ctx.user.id, tier: input.tier,
          weightGrams: String(input.weightGrams),
          goldCoinsUsed: input.goldCoinsUsed, txHash, status: "processing",
        });
        await createNotification({
          userId: ctx.user.id, type: "minting", title: "Gold Bar Minting Started!",
          body: "Your " + input.weightGrams + "g gold bar is being minted. TX: " + txHash,
          icon: "flame", actionLabel: "View Minting",
        });
        return { success: true, txHash };
      }),
  }),
  nfcCard: router({
    list: protectedProcedure.query(async ({ ctx }) => getUserNfcCards(ctx.user.id)),
    create: protectedProcedure
      .input(z.object({
        cardholderName: safeText(1, 128),
        cardType: z.enum(["virtual", "physical"]).default("virtual"),
        pin: z.string().regex(/^\d{4}$/),
      }))
      .mutation(async ({ ctx, input }) => {
        const user = await getUserById(ctx.user.id);
        if (user?.kycStatus !== "verified") throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Identity verification is required before requesting a card" });
        const last4 = Math.floor(1000 + Math.random() * 9000).toString();
        const cardNumber = "**** **** **** " + last4;
        const now = new Date();
        await createNfcCard({
          userId: ctx.user.id, cardNumber,
          cardholderName: input.cardholderName,
          expiryMonth: now.getMonth() + 1,
          expiryYear: now.getFullYear() + 4,
          cardType: input.cardType,
          issuanceStatus: input.cardType === "physical" ? "pending" : "issued",
          pinHash: await hashPassword(input.pin),
        });
        return { success: true, cardNumber, status: input.cardType === "physical" ? "pending" : "issued" };
      }),
    toggleFreeze: protectedProcedure
      .input(z.object({ id: z.number(), frozen: z.boolean() }))
      .mutation(async ({ ctx, input }) => {
        await updateNfcCard(input.id, ctx.user.id, { isFrozen: input.frozen });
        return { success: true };
      }),
    updateLimits: protectedProcedure
      .input(z.object({
        id: z.number(),
        dailyLimit: z.string().optional(),
        monthlyLimit: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;
        await updateNfcCard(id, ctx.user.id, data);
        return { success: true };
      }),
    changePin: protectedProcedure
      .input(z.object({ id: z.number(), pin: z.string().regex(/^\d{4}$/), twoFactorCode: z.string().min(6).max(32).optional() }))
      .mutation(async ({ ctx, input }) => {
        await verifyUserSecondFactor(ctx.user.id, input.twoFactorCode);
        await updateNfcCard(input.id, ctx.user.id, { pinHash: await hashPassword(input.pin) });
        return { success: true };
      }),
    pay: protectedProcedure
      .input(z.object({ id: z.number(), amount: positiveAmountString, currency: assetSymbol, merchant: safeText(2, 128) }))
      .mutation(async ({ ctx, input }) => {
        const { getDb } = await import("./db"); const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        const { nfcCards: cardsTable, transactions: transactionsTable, wallets: walletsTable } = await import("../drizzle/schema");
        return db.transaction(async (transactionDb) => {
          await transactionDb.execute(sql`SELECT ${cardsTable.id} FROM ${cardsTable} WHERE ${cardsTable.id} = ${input.id} FOR UPDATE`);
          const [card] = await transactionDb.select().from(cardsTable).where(and(eq(cardsTable.id, input.id), eq(cardsTable.userId, ctx.user.id))).limit(1);
          if (!card || card.issuanceStatus !== "issued" || !card.isActive || card.isFrozen) throw new TRPCError({ code: "BAD_REQUEST", message: "Card is not available for payments" });
          const now = new Date(); const dayKey = now.toISOString().slice(0, 10); const monthKey = dayKey.slice(0, 7); const amount = Number(input.amount);
          const spentToday = card.spendDayKey === dayKey ? Number(card.spentToday) : 0; const spentMonth = card.spendMonthKey === monthKey ? Number(card.spentThisMonth) : 0;
          if (spentToday + amount > Number(card.dailyLimit) || spentMonth + amount > Number(card.monthlyLimit)) throw new TRPCError({ code: "BAD_REQUEST", message: "Card spending limit exceeded" });
          await transactionDb.execute(sql`SELECT ${walletsTable.id} FROM ${walletsTable} WHERE ${walletsTable.userId} = ${ctx.user.id} AND ${walletsTable.currency} = ${input.currency} FOR UPDATE`);
          const [wallet] = await transactionDb.select().from(walletsTable).where(and(eq(walletsTable.userId, ctx.user.id), eq(walletsTable.currency, input.currency))).limit(1);
          if (!wallet || Number(wallet.balance) < amount) throw new TRPCError({ code: "BAD_REQUEST", message: "Insufficient linked wallet balance" });
          await transactionDb.update(walletsTable).set({ balance: (Number(wallet.balance) - amount).toFixed(8) }).where(eq(walletsTable.id, wallet.id));
          await transactionDb.update(cardsTable).set({ spentToday: (spentToday + amount).toFixed(2), spentThisMonth: (spentMonth + amount).toFixed(2), spendDayKey: dayKey, spendMonthKey: monthKey }).where(eq(cardsTable.id, card.id));
          await transactionDb.insert(transactionsTable).values({ userId: ctx.user.id, type: "nfc_payment", currency: input.currency, amount: input.amount, status: "confirmed", note: `Card payment: ${input.merchant}`, metadata: { cardId: card.id, merchant: input.merchant } });
          return { success: true };
        });
      }),
  }),
  otp: router({
    send: publicProcedure
      .input(z.object({
        identifier: z.string().min(3).max(320), // email or phone
        method: z.enum(["email", "phone"]),
      }))
      .mutation(async ({ input }) => {
        const code = await storeOtp(input.identifier, input.method);
        if (input.method === "email") {
          const result = await sendOtpEmail(input.identifier, code);
          if (!result.success) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: result.error ?? "Failed to send verification email. Please try again.",
            });
          }
        } else {
          const result = await sendOtpSms(input.identifier, code);
          if (!result.success) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: result.error ?? "Failed to send SMS. Please try again.",
            });
          }
        }
        return { success: true, message: `Verification code sent to ${input.identifier}` };
      }),
    verify: publicProcedure
      .input(z.object({
        identifier: z.string().min(3).max(320),
        code: z.string().length(6),
      }))
      .mutation(async ({ input }) => {
        const result = await verifyOtp(input.identifier, input.code);
        if (!result.valid) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: result.reason ?? "Invalid verification code.",
          });
        }
        return { success: true };
      }),
  }),
  priceAlert: router({
    list: protectedProcedure.query(async ({ ctx }) => getUserPriceAlerts(ctx.user.id)),
    create: protectedProcedure
      .input(z.object({
        asset: z.string().max(16),
        condition: z.enum(["above", "below"]),
        targetPrice: positiveAmountString,
      }))
      .mutation(async ({ ctx, input }) => {
        await createPriceAlert({ ...input, userId: ctx.user.id });
        return { success: true };
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await deletePriceAlert(input.id, ctx.user.id);
        return { success: true };
      }),
  }),
  investment: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const { getUserInvestments } = await import("./db");
      return getUserInvestments(ctx.user.id);
    }),
    create: protectedProcedure
      .input(investmentCreationSchema)
      .mutation(async ({ ctx, input }) => {
        const { getDb } = await import("./db");
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
        const { investmentAgreements, investments: investmentsTable, notifications: notificationsTable, wallets: walletsTable } = await import("../drizzle/schema");
        const amount = Number(input.amount);
        await db.transaction(async (transactionDb) => {
          if (amount > 10_000) {
            if (!input.agreementId) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "A signed premium investment agreement is required" });
            const [agreement] = await transactionDb.select().from(investmentAgreements).where(and(eq(investmentAgreements.id, input.agreementId), eq(investmentAgreements.userId, ctx.user.id), eq(investmentAgreements.planId, input.planId), isNotNull(investmentAgreements.signedAt))).limit(1);
            if (!agreement || agreement.expiresAt < new Date() || Number(agreement.amount) !== amount || agreement.currency !== input.currency) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "The signed investment agreement is invalid or expired" });
          }
          await transactionDb.execute(sql`SELECT ${walletsTable.id} FROM ${walletsTable} WHERE ${walletsTable.userId} = ${ctx.user.id} AND ${walletsTable.currency} = ${input.currency} FOR UPDATE`);
          const [wallet] = await transactionDb.select().from(walletsTable).where(and(eq(walletsTable.userId, ctx.user.id), eq(walletsTable.currency, input.currency))).limit(1);
          const balance = Number(wallet?.balance ?? 0);
          if (!wallet || balance < amount) {
            throw new TRPCError({ code: "BAD_REQUEST", message: "Insufficient wallet balance. Please deposit funds first." });
          }
          const endDate = new Date();
          endDate.setDate(endDate.getDate() + input.duration);
          await transactionDb.update(walletsTable).set({ balance: (balance - amount).toFixed(8) }).where(eq(walletsTable.id, wallet.id));
          await transactionDb.insert(investmentsTable).values({
            userId: ctx.user.id, planId: input.planId, planName: input.planName,
            amount: input.amount, currency: input.currency,
            expectedRoi: input.expectedRoi, duration: input.duration, endDate,
          });
          await transactionDb.insert(notificationsTable).values({
            userId: ctx.user.id, type: "system", title: "Investment Activated",
            body: `Your ${input.planName} investment of ${input.amount} ${input.currency} is now active. Expected ROI: ${input.expectedRoi}%.`,
            icon: "trending-up",
          });
        });
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
