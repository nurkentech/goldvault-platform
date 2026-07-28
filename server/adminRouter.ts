import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { adminProcedure, router } from "./_core/trpc";
import {
  getPlatformStats, getAllUsers, adminUpdateUser,
  getAllTransactions, adminUpdateTransaction,
  adminCreditWallet, adminDebitWallet,
  createAnnouncement, getAnnouncements, updateAnnouncement, deleteAnnouncement,
  getRecentActivity, getUserGrowthData, getPendingWithdrawals,
  getTransactionById, approveWithdrawalTransaction,
} from "./adminDb";
import { getUserById, createNotification, createTransaction } from "./db";
import { getPlatformSettings, savePlatformSettings } from "./platformSettings";
import { sendTransactionalEmail } from "./transactionalEmail";
import { listAdminAuditLogs } from "./adminAudit";
import { payReferralCommission } from "./referrals";
import { dispatchWebhook, recalculateLoyaltyTier } from "./advancedModules";
import {
  deleteWebsitePage,
  getWebsiteContent,
  saveWebsiteBranding,
  saveWebsiteHome,
  saveWebsitePage,
} from "./cms";
import { storagePut } from "./storage";

const decimalString = z
  .string()
  .trim()
  .regex(/^\d+(?:\.\d{1,8})?$/, "Enter a valid non-negative amount");

const safeCmsText = (minimum: number, maximum: number) =>
  z.string().trim().min(minimum).max(maximum);
const safeCmsUrl = z
  .string()
  .trim()
  .max(2048)
  .refine(
    (value) =>
      value === "" ||
      value.startsWith("/") ||
      /^https:\/\/[^\s]+$/i.test(value),
    "Use a site path or secure HTTPS URL",
  );
const reservedPageSlugs = new Set([
  "admin", "dashboard", "profile", "verify-2fa", "api", "assets", "buy-gold",
  "gvt-token", "vault-storage", "physical-delivery", "gold-price-alerts",
  "exchange", "markets", "nfc-card", "goldcoins", "referral", "ref", "about",
  "mining-partners", "vault-audits", "security", "careers", "contact",
  "how-it-works", "faq", "blog", "gold-vs-bitcoin", "trade", "social",
  "challenges", "gold-etf", "bitcoin-wallet", "mint", "wallet", "deposit",
  "withdraw", "investments", "transactions", "rewards", "cards", "support",
  "settings", "notifications", "privacy-policy", "terms", "cookie-policy",
  "risk-disclosure", "404",
]);
const pageSlug = z
  .string()
  .trim()
  .toLowerCase()
  .min(2)
  .max(96)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens")
  .refine((slug) => !reservedPageSlugs.has(slug), "That URL is reserved by the platform");
const websiteBrandingSchema = z.object({
  siteName: safeCmsText(1, 128),
  tagline: z.string().trim().max(240),
  logoUrl: safeCmsUrl,
  logoAlt: safeCmsText(1, 160),
});
const websiteHomeSchema = z.object({
  badge: z.string().trim().max(160),
  title: safeCmsText(1, 160),
  titleAccent: z.string().trim().max(160),
  subtitle: safeCmsText(1, 1200),
  primaryCtaLabel: safeCmsText(1, 64),
  secondaryCtaLabel: safeCmsText(1, 64),
  secondaryCtaUrl: safeCmsUrl.refine((value) => value !== "", "CTA URL is required"),
  heroImageUrl: safeCmsUrl,
});
const websitePageSchema = z.object({
  id: z.string().uuid().optional(),
  slug: pageSlug,
  title: safeCmsText(1, 200),
  excerpt: z.string().trim().max(500),
  body: safeCmsText(1, 50_000),
  seoTitle: z.string().trim().max(200),
  seoDescription: z.string().trim().max(320),
  status: z.enum(["draft", "published"]),
  showInNavigation: z.boolean(),
  sortOrder: z.number().int().min(0).max(10_000),
});

const platformSettingsSchema = z.object({
  general: z.object({
    platformName: z.string().trim().min(1).max(128),
    supportEmail: z.string().trim().email().max(320),
    defaultCurrency: z.enum(["USD", "EUR", "GBP", "NGN"]),
    timezone: z.string().trim().min(1).max(64),
    enableRegistrations: z.boolean(),
    requireEmailVerification: z.boolean(),
  }),
  fees: z.object({
    tradingFee: decimalString,
    withdrawalFee: decimalString,
    depositFee: decimalString,
    minDeposit: decimalString,
    maxWithdrawal: decimalString,
    dailyWithdrawalLimit: decimalString,
  }),
  security: z.object({
    requireKycForWithdrawals: z.boolean(),
    enforce2faAdmin: z.boolean(),
    autoLockSuspicious: z.boolean(),
    ipWhitelist: z.boolean(),
  }),
  notifications: z.object({
    emailOnRegistration: z.boolean(),
    emailOnLargeWithdrawal: z.boolean(),
    emailOnKycSubmission: z.boolean(),
    dailySummary: z.boolean(),
  }),
  maintenance: z.object({
    enabled: z.boolean(),
    message: z.string().trim().min(1).max(1000),
    startTime: z.string().max(64),
    endTime: z.string().max(64),
  }),
  supportedAssets: z
    .array(z.string().trim().toUpperCase().regex(/^[A-Z0-9]{2,16}$/))
    .min(1)
    .max(50),
  depositAddresses: z.record(
    z.string().regex(/^[A-Z0-9]{2,16}$/),
    z.string().trim().min(3).max(256),
  ),
  compliance: z.object({
    largeTransactionThreshold: decimalString.refine((value) => Number(value) > 0),
    rapidWithdrawalCount: z.number().int().min(2).max(100),
    rapidWithdrawalWindowMinutes: z.number().int().min(1).max(1440),
  }),
});

export const adminRouter = router({
  stats: adminProcedure.query(async () => {
    return getPlatformStats();
  }),

  settings: router({
    get: adminProcedure.query(async () => getPlatformSettings()),
    update: adminProcedure
      .input(platformSettingsSchema)
      .mutation(async ({ input }) => {
        const current = await getPlatformSettings();
        return savePlatformSettings({ ...current, ...input, website: current.website });
      }),
  }),

  cms: router({
    get: adminProcedure.query(() => getWebsiteContent()),
    updateBranding: adminProcedure
      .input(websiteBrandingSchema)
      .mutation(({ input }) => saveWebsiteBranding(input)),
    updateHome: adminProcedure
      .input(websiteHomeSchema)
      .mutation(({ input }) => saveWebsiteHome(input)),
    savePage: adminProcedure
      .input(websitePageSchema)
      .mutation(({ input }) => saveWebsitePage(input)),
    deletePage: adminProcedure
      .input(z.object({ id: z.string().uuid() }))
      .mutation(({ input }) => deleteWebsitePage(input.id)),
    uploadBrandAsset: adminProcedure
      .input(z.object({
        filename: z.string().trim().min(1).max(180),
        mimeType: z.enum(["image/jpeg", "image/png", "image/webp", "image/gif"]),
        dataBase64: z.string().min(16).max(4_000_000),
      }))
      .mutation(async ({ input }) => {
        const buffer = Buffer.from(input.dataBase64, "base64");
        if (buffer.length === 0 || buffer.length > 2 * 1024 * 1024) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Brand images must be smaller than 2 MB",
          });
        }
        const extension = {
          "image/jpeg": "jpg",
          "image/png": "png",
          "image/webp": "webp",
          "image/gif": "gif",
        }[input.mimeType];
        return storagePut(
          `cms/branding/${Date.now()}-${input.filename.replace(/[^a-z0-9._-]/gi, "-")}.${extension}`,
          buffer,
          input.mimeType,
        );
      }),
  }),

  audit: router({
    list: adminProcedure
      .input(z.object({ limit: z.number().int().min(1).max(500).default(100) }))
      .query(({ input }) => listAdminAuditLogs(input.limit)),
  }),

  users: router({
    list: adminProcedure
      .input(z.object({
        limit: z.number().min(1).max(200).default(50),
        offset: z.number().min(0).default(0),
        search: z.string().optional(),
        role: z.string().optional(),
        kycStatus: z.string().optional(),
      }))
      .query(async ({ input }) => getAllUsers(input)),

    getById: adminProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const user = await getUserById(input.id);
        if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
        return user;
      }),

    update: adminProcedure
      .input(z.object({
        id: z.number(),
        role: z.enum(["user", "admin"]).optional(),
        kycStatus: z.enum(["unverified", "pending", "verified", "rejected"]).optional(),
        tier: z.enum(["bronze", "silver", "gold", "platinum", "diamond", "legendary"]).optional(),
        goldCoins: z.number().optional(),
        isOnline: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await adminUpdateUser(id, data);
        return { success: true };
      }),

    approveKyc: adminProcedure
      .input(z.object({ userId: z.number() }))
      .mutation(async ({ input }) => {
        await adminUpdateUser(input.userId, { kycStatus: "verified" });
        await createNotification({
          userId: input.userId, type: "system",
          title: "KYC Approved!",
          body: "Your identity verification has been approved. You now have full access to all platform features.",
          icon: "shield-check",
        });
        const user = await getUserById(input.userId);
        await sendTransactionalEmail({ to: user?.email, kind: "kyc_approved" });
        void dispatchWebhook("kyc.approved", { userId: input.userId });
        return { success: true };
      }),

    rejectKyc: adminProcedure
      .input(z.object({ userId: z.number(), reason: z.string().optional() }))
      .mutation(async ({ input }) => {
        await adminUpdateUser(input.userId, { kycStatus: "rejected" });
        await createNotification({
          userId: input.userId, type: "system",
          title: "KYC Rejected",
          body: input.reason || "Your identity verification was rejected. Please resubmit with clearer documents.",
          icon: "shield-x",
        });
        const user = await getUserById(input.userId);
        await sendTransactionalEmail({
          to: user?.email,
          kind: "kyc_rejected",
          reason: input.reason,
        });
        return { success: true };
      }),
  }),

  transactions: router({
    list: adminProcedure
      .input(z.object({
        limit: z.number().min(1).max(200).default(50),
        offset: z.number().min(0).default(0),
        type: z.string().optional(),
        status: z.string().optional(),
        search: z.string().optional(),
      }))
      .query(async ({ input }) => getAllTransactions(input)),

    update: adminProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["pending", "confirmed", "failed", "cancelled"]).optional(),
        note: z.string().trim().max(2000).optional(),
      }))
      .mutation(async ({ input }) => {
        const existing = await getTransactionById(input.id);
        if (!existing) throw new TRPCError({ code: "NOT_FOUND", message: "Transaction not found" });
        if (existing.type === "withdrawal" && input.status === "confirmed") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Use the withdrawal approval action so the wallet is debited safely.",
          });
        }
        const { id, ...data } = input;
        await adminUpdateTransaction(id, data);
        if (existing.type === "deposit" && existing.status !== "confirmed" && input.status === "confirmed") {
          await createNotification({
            userId: existing.userId,
            type: "transaction",
            title: "Deposit Confirmed",
            body: `${existing.amount} ${existing.currency} has been confirmed.`,
            icon: "arrow-down",
          });
          const user = await getUserById(existing.userId);
          await sendTransactionalEmail({
            to: user?.email,
            kind: "deposit_confirmed",
            amount: existing.amount,
            currency: existing.currency,
          });
          await payReferralCommission({
            sourceTransactionId: existing.id,
            referredUserId: existing.userId,
            currency: existing.currency,
            sourceAmount: existing.amount,
          });
          void dispatchWebhook("deposit.confirmed", { transactionId: existing.id, userId: existing.userId, amount: existing.amount, currency: existing.currency });
        }
        if (existing.status !== "confirmed" && input.status === "confirmed" && ["buy", "sell"].includes(existing.type)) {
          await recalculateLoyaltyTier(existing.userId);
        }
        return { success: true };
      }),

    pendingWithdrawals: adminProcedure.query(async () => getPendingWithdrawals()),

    approveWithdrawal: adminProcedure
      .input(z.object({ txId: z.number() }))
      .mutation(async ({ input }) => {
        let withdrawal;
        try {
          withdrawal = await approveWithdrawalTransaction(input.txId);
        } catch (error) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: error instanceof Error ? error.message : "Withdrawal approval failed",
          });
        }
        await createNotification({
          userId: withdrawal.userId,
          type: "transaction",
          title: "Withdrawal Approved",
          body: `${withdrawal.amount} ${withdrawal.currency} has been approved.`,
          icon: "arrow-up",
        });
        const user = await getUserById(withdrawal.userId);
        await sendTransactionalEmail({
          to: user?.email,
          kind: "withdrawal_approved",
          amount: withdrawal.amount,
          currency: withdrawal.currency,
        });
        return { success: true };
      }),

    rejectWithdrawal: adminProcedure
      .input(z.object({ txId: z.number(), reason: z.string().optional() }))
      .mutation(async ({ input }) => {
        const withdrawal = await getTransactionById(input.txId);
        if (!withdrawal || withdrawal.type !== "withdrawal") {
          throw new TRPCError({ code: "NOT_FOUND", message: "Withdrawal not found" });
        }
        await adminUpdateTransaction(input.txId, { status: "failed", note: input.reason });
        await createNotification({
          userId: withdrawal.userId,
          type: "transaction",
          title: "Withdrawal Rejected",
          body: input.reason || "Your withdrawal request was not approved.",
          icon: "arrow-up",
        });
        const user = await getUserById(withdrawal.userId);
        await sendTransactionalEmail({
          to: user?.email,
          kind: "withdrawal_rejected",
          amount: withdrawal.amount,
          currency: withdrawal.currency,
          reason: input.reason,
        });
        return { success: true };
      }),
  }),

  wallet: router({
    credit: adminProcedure
      .input(z.object({
        userId: z.number(),
        currency: z.string(),
        amount: z.string(),
        reason: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await adminCreditWallet(input.userId, input.currency, input.amount);
        await createTransaction({
          userId: input.userId, type: "deposit", currency: input.currency,
          amount: input.amount, status: "confirmed", note: input.reason ?? "Admin credit",
        });
        await createNotification({
          userId: input.userId, type: "transaction",
          title: "Funds Credited",
          body: `${input.amount} ${input.currency} has been credited to your wallet.`,
          icon: "wallet",
        });
        const user = await getUserById(input.userId);
        await sendTransactionalEmail({
          to: user?.email,
          kind: "deposit_confirmed",
          amount: input.amount,
          currency: input.currency,
        });
        return { success: true };
      }),

    debit: adminProcedure
      .input(z.object({
        userId: z.number(),
        currency: z.string(),
        amount: z.string(),
        reason: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await adminDebitWallet(input.userId, input.currency, input.amount);
        await createTransaction({
          userId: input.userId, type: "withdrawal", currency: input.currency,
          amount: input.amount, status: "confirmed", note: input.reason ?? "Admin debit",
        });
        return { success: true };
      }),
  }),

  announcements: router({
    list: adminProcedure.query(async () => getAnnouncements()),
    create: adminProcedure
      .input(z.object({
        title: z.string().min(1).max(256),
        body: z.string().min(1).max(2000),
        icon: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await createAnnouncement(input);
        return { success: true };
      }),
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().min(1).max(256).optional(),
        body: z.string().min(1).max(2000).optional(),
        icon: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await updateAnnouncement(id, data);
        return { success: true };
      }),
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteAnnouncement(input.id);
        return { success: true };
      }),
  }),

  activity: adminProcedure
    .input(z.object({ limit: z.number().default(20) }).optional())
    .query(async ({ input }) => getRecentActivity(input?.limit ?? 20)),

  userGrowth: adminProcedure.query(async () => getUserGrowthData()),
});
