import crypto from "crypto";
import { TRPCError } from "@trpc/server";
import { and, desc, eq, gt, inArray, isNull, lte, ne, or, sql, sum } from "drizzle-orm";
import { z } from "zod";
import {
  affiliatePayouts, affiliateProfiles, amlAlerts, apiKeys, blogCategories, blogPosts,
  investmentAgreements, nfcCards, notifications, p2pDisputes, p2pMessages, p2pOffers, p2pOrders,
  pushSubscriptions, recurringSchedules, savingsVaults, stakingPositions,
  supportTicketMessages, supportTickets, suspiciousActivityReports, transactions,
  trustedWithdrawalIps, users, wallets, webhookDeliveries, webhookEndpoints,
} from "../drizzle/schema";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { getDb, getUserById } from "./db";
import { getClientIp } from "./loginRateLimit";
import { publicCmsAssetUrl, safeText, secureUploadUrl } from "./validation";
import { verifyOtp } from "./emailOtp";
import { getPlatformSettings } from "./platformSettings";

const money = z.string().trim().regex(/^\d+(?:\.\d{1,8})?$/).refine((value) => Number(value) > 0);
const asset = z.string().trim().toUpperCase().regex(/^[A-Z0-9]{2,16}$/);

function hash(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function randomSecret(bytes = 32) {
  return crypto.randomBytes(bytes).toString("base64url");
}

function nextScheduleDate(frequency: "daily" | "weekly" | "monthly", from = new Date()) {
  const next = new Date(from);
  if (frequency === "daily") next.setDate(next.getDate() + 1);
  if (frequency === "weekly") next.setDate(next.getDate() + 7);
  if (frequency === "monthly") next.setMonth(next.getMonth() + 1);
  return next;
}

export function calculateStakingRedemption(input: {
  amount: string | number; apy: string | number; startsAt: Date; unlocksAt: Date; now?: Date;
}) {
  const amount = Number(input.amount);
  const apy = Number(input.apy);
  const now = input.now ?? new Date();
  const elapsedDays = Math.max(0, (now.getTime() - input.startsAt.getTime()) / 86_400_000);
  const yieldEarned = amount * (apy / 100) * (elapsedDays / 365);
  const early = now < input.unlocksAt;
  const penalty = early ? amount * 0.05 : 0;
  return { yieldEarned, penalty, payout: amount + yieldEarned - penalty, early };
}

export function tierForVolume(volume: number) {
  if (volume >= 250_000) return { tier: "platinum" as const, feeDiscount: 50, prioritySupport: true, exclusivePlans: true };
  if (volume >= 50_000) return { tier: "gold" as const, feeDiscount: 25, prioritySupport: true, exclusivePlans: true };
  if (volume >= 10_000) return { tier: "silver" as const, feeDiscount: 10, prioritySupport: false, exclusivePlans: false };
  return { tier: "bronze" as const, feeDiscount: 0, prioritySupport: false, exclusivePlans: false };
}

export function calculateFifoCapitalGains(rows: Array<{ id: number; type: string; currency: string; amount: string; createdAt: Date; metadata: unknown }>) {
  const lots = new Map<string, Array<{ quantity: number; unitCost: number }>>();
  const disposals: Array<{ transactionId: number; date: string; asset: string; quantity: number; proceeds: number; costBasis: number; gainLoss: number }> = [];
  for (const row of rows) {
    const quantity = Number(row.amount); if (!Number.isFinite(quantity) || quantity <= 0) continue;
    const metadata = (row.metadata ?? {}) as { unitPriceUsd?: number | string; fiatValueUsd?: number | string };
    const unitPrice = Number(metadata.unitPriceUsd ?? (metadata.fiatValueUsd ? Number(metadata.fiatValueUsd) / quantity : 1));
    if (["buy", "receive", "deposit"].includes(row.type)) {
      const queue = lots.get(row.currency) ?? []; queue.push({ quantity, unitCost: unitPrice }); lots.set(row.currency, queue); continue;
    }
    if (!["sell", "send", "withdrawal"].includes(row.type)) continue;
    let remaining = quantity; let costBasis = 0; const queue = lots.get(row.currency) ?? [];
    while (remaining > 0 && queue.length) { const lot = queue[0]; const used = Math.min(remaining, lot.quantity); costBasis += used * lot.unitCost; lot.quantity -= used; remaining -= used; if (lot.quantity <= 1e-12) queue.shift(); }
    costBasis += remaining * unitPrice;
    const proceeds = quantity * unitPrice;
    disposals.push({ transactionId: row.id, date: row.createdAt.toISOString(), asset: row.currency, quantity, proceeds, costBasis, gainLoss: proceeds - costBasis });
  }
  return disposals;
}

async function selectWalletForUpdate(transactionDb: any, userId: number, currency: string) {
  await transactionDb.execute(sql`SELECT ${wallets.id} FROM ${wallets} WHERE ${wallets.userId} = ${userId} AND ${wallets.currency} = ${currency} FOR UPDATE`);
  const [wallet] = await transactionDb.select().from(wallets)
    .where(and(eq(wallets.userId, userId), eq(wallets.currency, currency))).limit(1);
  return wallet as typeof wallets.$inferSelect | undefined;
}

async function creditWallet(transactionDb: any, userId: number, currency: string, amount: number) {
  const wallet = await selectWalletForUpdate(transactionDb, userId, currency);
  if (wallet) {
    await transactionDb.update(wallets).set({ balance: (Number(wallet.balance) + amount).toFixed(8) }).where(eq(wallets.id, wallet.id));
  } else {
    await transactionDb.insert(wallets).values({ userId, currency, balance: amount.toFixed(8) });
  }
}

async function debitWallet(transactionDb: any, userId: number, currency: string, amount: number) {
  const wallet = await selectWalletForUpdate(transactionDb, userId, currency);
  if (!wallet || Number(wallet.balance) < amount) throw new TRPCError({ code: "BAD_REQUEST", message: "Insufficient wallet balance" });
  await transactionDb.update(wallets).set({ balance: (Number(wallet.balance) - amount).toFixed(8) }).where(eq(wallets.id, wallet.id));
}

export async function monitorTransaction(input: { userId: number; transactionId?: number; type: string; amount: number; currency: string }) {
  const db = await getDb();
  if (!db) return [];
  const alerts: Array<{ rule: string; riskScore: number; details: Record<string, unknown> }> = [];
  const settings = await getPlatformSettings();
  const largeThreshold = Number(settings.compliance.largeTransactionThreshold);
  if (input.amount >= largeThreshold) alerts.push({ rule: "large_transaction", riskScore: 70, details: { threshold: largeThreshold, ...input } });
  if (input.type === "withdrawal") {
    const since = new Date(Date.now() - settings.compliance.rapidWithdrawalWindowMinutes * 60_000);
    const recent = await db.select({ id: transactions.id }).from(transactions)
      .where(and(eq(transactions.userId, input.userId), eq(transactions.type, "withdrawal"), gt(transactions.createdAt, since)));
    if (recent.length >= settings.compliance.rapidWithdrawalCount) alerts.push({ rule: "rapid_withdrawals", riskScore: 85, details: { countInWindow: recent.length, windowMinutes: settings.compliance.rapidWithdrawalWindowMinutes } });
  }
  if (alerts.length) await db.insert(amlAlerts).values(alerts.map((alert) => ({ ...alert, userId: input.userId, transactionId: input.transactionId })));
  return alerts;
}

export async function dispatchWebhook(event: string, payload: Record<string, unknown>) {
  const db = await getDb();
  if (!db) return;
  const endpoints = await db.select().from(webhookEndpoints).where(eq(webhookEndpoints.isActive, true));
  await Promise.allSettled(endpoints.filter((endpoint) => endpoint.events.includes(event)).map(async (endpoint) => {
    const body = JSON.stringify({ id: crypto.randomUUID(), event, createdAt: new Date().toISOString(), data: payload });
    const signature = crypto.createHmac("sha256", endpoint.secret).update(body).digest("hex");
    let responseStatus: number | null = null;
    let error: string | null = null;
    try {
      const response = await fetch(endpoint.url, { method: "POST", headers: { "content-type": "application/json", "x-goldvaults-signature": signature }, body, signal: AbortSignal.timeout(8_000) });
      responseStatus = response.status;
      if (!response.ok) error = `HTTP ${response.status}`;
    } catch (cause) { error = cause instanceof Error ? cause.message : "Delivery failed"; }
    await db.insert(webhookDeliveries).values({ webhookId: endpoint.id, event, attempts: 1, responseStatus, error, deliveredAt: error ? null : new Date() });
  }));
}

export async function recalculateLoyaltyTier(userId: number) {
  const db = await getDb();
  if (!db) return tierForVolume(0);
  const [row] = await db.select({ volume: sum(transactions.amount) }).from(transactions)
    .where(and(eq(transactions.userId, userId), eq(transactions.status, "confirmed"), inArray(transactions.type, ["buy", "sell"])));
  const result = tierForVolume(Number(row?.volume ?? 0));
  await db.update(users).set({ tier: result.tier }).where(eq(users.id, userId));
  return { ...result, volume: Number(row?.volume ?? 0) };
}

export const advancedRouter = router({
  p2p: router({
    offers: publicProcedure.input(z.object({ asset: asset.optional(), side: z.enum(["buy", "sell"]).optional() }).optional()).query(async ({ input }) => {
      const db = await getDb(); if (!db) return [];
      const conditions: any[] = [eq(p2pOffers.status, "active")];
      if (input?.asset) conditions.push(eq(p2pOffers.asset, input.asset));
      if (input?.side) conditions.push(eq(p2pOffers.side, input.side));
      return db.select().from(p2pOffers).where(and(...conditions)).orderBy(desc(p2pOffers.createdAt)).limit(100);
    }),
    createOffer: protectedProcedure.input(z.object({ side: z.enum(["buy", "sell"]), asset, fiatCurrency: z.enum(["USD", "EUR", "GBP", "NGN"]), price: money, minAmount: money, maxAmount: money, availableAmount: money, paymentMethods: z.array(safeText(1, 64)).min(1).max(10), terms: safeText(0, 2000).optional() })).mutation(async ({ ctx, input }) => {
      if (Number(input.minAmount) > Number(input.maxAmount) || Number(input.maxAmount) > Number(input.availableAmount)) throw new TRPCError({ code: "BAD_REQUEST", message: "Offer limits are inconsistent" });
      const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db.insert(p2pOffers).values({ ...input, userId: ctx.user.id }); return { success: true };
    }),
    myOrders: protectedProcedure.query(async ({ ctx }) => { const db = await getDb(); return db ? db.select().from(p2pOrders).where(or(eq(p2pOrders.buyerId, ctx.user.id), eq(p2pOrders.sellerId, ctx.user.id))).orderBy(desc(p2pOrders.createdAt)) : []; }),
    openOrder: protectedProcedure.input(z.object({ offerId: z.number().int().positive(), amount: money })).mutation(async ({ ctx, input }) => {
      const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      return db.transaction(async (tx) => {
        await tx.execute(sql`SELECT ${p2pOffers.id} FROM ${p2pOffers} WHERE ${p2pOffers.id} = ${input.offerId} FOR UPDATE`);
        const [offer] = await tx.select().from(p2pOffers).where(eq(p2pOffers.id, input.offerId)).limit(1);
        const amount = Number(input.amount);
        if (!offer || offer.status !== "active" || offer.userId === ctx.user.id || amount < Number(offer.minAmount) || amount > Number(offer.maxAmount) || amount > Number(offer.availableAmount)) throw new TRPCError({ code: "BAD_REQUEST", message: "Offer is unavailable for this amount" });
        const sellerId = offer.side === "sell" ? offer.userId : ctx.user.id;
        const buyerId = offer.side === "sell" ? ctx.user.id : offer.userId;
        await debitWallet(tx, sellerId, offer.asset, amount);
        const [inserted] = await tx.insert(p2pOrders).values({ offerId: offer.id, buyerId, sellerId, asset: offer.asset, amount: input.amount, fiatCurrency: offer.fiatCurrency, fiatAmount: (amount * Number(offer.price)).toFixed(2), expiresAt: new Date(Date.now() + 30 * 60_000) }).$returningId();
        const remaining = Number(offer.availableAmount) - amount;
        await tx.update(p2pOffers).set({ availableAmount: remaining.toFixed(8), status: remaining < Number(offer.minAmount) ? "closed" : "active" }).where(eq(p2pOffers.id, offer.id));
        return { orderId: inserted.id, status: "escrowed" as const };
      });
    }),
    markPaid: protectedProcedure.input(z.object({ orderId: z.number(), paymentReference: safeText(1, 128) })).mutation(async ({ ctx, input }) => {
      const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const result = await db.update(p2pOrders).set({ status: "paid", paymentReference: input.paymentReference }).where(and(eq(p2pOrders.id, input.orderId), eq(p2pOrders.buyerId, ctx.user.id), eq(p2pOrders.status, "escrowed")));
      return { success: true, result };
    }),
    release: protectedProcedure.input(z.object({ orderId: z.number() })).mutation(async ({ ctx, input }) => {
      const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      return db.transaction(async (tx) => {
        await tx.execute(sql`SELECT ${p2pOrders.id} FROM ${p2pOrders} WHERE ${p2pOrders.id} = ${input.orderId} FOR UPDATE`);
        const [order] = await tx.select().from(p2pOrders).where(eq(p2pOrders.id, input.orderId)).limit(1);
        if (!order || order.sellerId !== ctx.user.id || order.status !== "paid") throw new TRPCError({ code: "BAD_REQUEST", message: "Order cannot be released" });
        await creditWallet(tx, order.buyerId, order.asset, Number(order.amount));
        await tx.update(p2pOrders).set({ status: "released" }).where(eq(p2pOrders.id, order.id));
        await tx.insert(transactions).values({ userId: order.buyerId, type: "receive", currency: order.asset, amount: order.amount, status: "confirmed", note: `P2P order #${order.id}` });
        return { success: true };
      });
    }),
    messages: protectedProcedure.input(z.object({ orderId: z.number() })).query(async ({ ctx, input }) => {
      const db = await getDb(); if (!db) return [];
      const [order] = await db.select().from(p2pOrders).where(eq(p2pOrders.id, input.orderId)).limit(1);
      if (!order || ![order.buyerId, order.sellerId].includes(ctx.user.id)) throw new TRPCError({ code: "FORBIDDEN" });
      return db.select().from(p2pMessages).where(eq(p2pMessages.orderId, input.orderId)).orderBy(p2pMessages.createdAt);
    }),
    sendMessage: protectedProcedure.input(z.object({ orderId: z.number(), body: safeText(1, 2000), attachmentUrl: secureUploadUrl.optional() })).mutation(async ({ ctx, input }) => {
      const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const [order] = await db.select().from(p2pOrders).where(eq(p2pOrders.id, input.orderId)).limit(1);
      if (!order || ![order.buyerId, order.sellerId].includes(ctx.user.id)) throw new TRPCError({ code: "FORBIDDEN" });
      await db.insert(p2pMessages).values({ ...input, senderId: ctx.user.id }); return { success: true };
    }),
    dispute: protectedProcedure.input(z.object({ orderId: z.number(), reason: safeText(10, 3000), evidence: z.array(secureUploadUrl).max(10).optional() })).mutation(async ({ ctx, input }) => {
      const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const [order] = await db.select().from(p2pOrders).where(eq(p2pOrders.id, input.orderId)).limit(1);
      if (!order || ![order.buyerId, order.sellerId].includes(ctx.user.id) || !["escrowed", "paid"].includes(order.status)) throw new TRPCError({ code: "BAD_REQUEST" });
      await db.transaction(async (tx) => { await tx.insert(p2pDisputes).values({ ...input, openedByUserId: ctx.user.id }); await tx.update(p2pOrders).set({ status: "disputed" }).where(eq(p2pOrders.id, input.orderId)); });
      return { success: true };
    }),
  }),
  staking: router({
    plans: publicProcedure.query(() => [{ asset: "BTC", durationDays: 30, apy: 4.5 }, { asset: "ETH", durationDays: 90, apy: 7.5 }, { asset: "USDT", durationDays: 180, apy: 11 }, { asset: "SOL", durationDays: 365, apy: 14 }]),
    list: protectedProcedure.query(async ({ ctx }) => { const db = await getDb(); return db ? db.select().from(stakingPositions).where(eq(stakingPositions.userId, ctx.user.id)).orderBy(desc(stakingPositions.startsAt)) : []; }),
    create: protectedProcedure.input(z.object({ asset, amount: money, durationDays: z.union([z.literal(30), z.literal(90), z.literal(180), z.literal(365)]), autoCompound: z.boolean().default(false) })).mutation(async ({ ctx, input }) => {
      const rates: Record<number, number> = { 30: 4.5, 90: 7.5, 180: 11, 365: 14 }; const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      return db.transaction(async (tx) => { await debitWallet(tx, ctx.user.id, input.asset, Number(input.amount)); const unlocksAt = new Date(Date.now() + input.durationDays * 86_400_000); const [row] = await tx.insert(stakingPositions).values({ ...input, userId: ctx.user.id, apy: String(rates[input.durationDays]), unlocksAt }).$returningId(); return { id: row.id, unlocksAt }; });
    }),
    withdraw: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
      const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      return db.transaction(async (tx) => { await tx.execute(sql`SELECT ${stakingPositions.id} FROM ${stakingPositions} WHERE ${stakingPositions.id} = ${input.id} FOR UPDATE`); const [position] = await tx.select().from(stakingPositions).where(and(eq(stakingPositions.id, input.id), eq(stakingPositions.userId, ctx.user.id))).limit(1); if (!position || position.status !== "active") throw new TRPCError({ code: "BAD_REQUEST" }); const redemption = calculateStakingRedemption(position); await creditWallet(tx, ctx.user.id, position.asset, redemption.payout); await tx.update(stakingPositions).set({ status: redemption.early ? "withdrawn_early" : "completed", accruedYield: redemption.yieldEarned.toFixed(8), endedAt: new Date() }).where(eq(stakingPositions.id, position.id)); return redemption; });
    }),
  }),
  vaults: router({
    list: protectedProcedure.query(async ({ ctx }) => { const db = await getDb(); return db ? db.select().from(savingsVaults).where(eq(savingsVaults.userId, ctx.user.id)).orderBy(desc(savingsVaults.createdAt)) : []; }),
    create: protectedProcedure.input(z.object({ name: safeText(1, 128), currency: asset, targetAmount: money, lockUntil: z.coerce.date().optional() })).mutation(async ({ ctx, input }) => { const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" }); await db.insert(savingsVaults).values({ ...input, userId: ctx.user.id }); return { success: true }; }),
    deposit: protectedProcedure.input(z.object({ id: z.number(), amount: money })).mutation(async ({ ctx, input }) => { const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" }); return db.transaction(async (tx) => { await tx.execute(sql`SELECT ${savingsVaults.id} FROM ${savingsVaults} WHERE ${savingsVaults.id} = ${input.id} FOR UPDATE`); const [vault] = await tx.select().from(savingsVaults).where(and(eq(savingsVaults.id, input.id), eq(savingsVaults.userId, ctx.user.id))).limit(1); if (!vault || vault.status !== "active") throw new TRPCError({ code: "BAD_REQUEST" }); await debitWallet(tx, ctx.user.id, vault.currency, Number(input.amount)); await tx.update(savingsVaults).set({ balance: (Number(vault.balance) + Number(input.amount)).toFixed(8) }).where(eq(savingsVaults.id, vault.id)); return { success: true }; }); }),
    withdraw: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => { const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" }); return db.transaction(async (tx) => { const [vault] = await tx.select().from(savingsVaults).where(and(eq(savingsVaults.id, input.id), eq(savingsVaults.userId, ctx.user.id))).limit(1); if (!vault || vault.status !== "active" || (vault.lockUntil && vault.lockUntil > new Date())) throw new TRPCError({ code: "BAD_REQUEST", message: "Vault is still locked" }); await creditWallet(tx, ctx.user.id, vault.currency, Number(vault.balance)); await tx.update(savingsVaults).set({ balance: "0", status: "closed" }).where(eq(savingsVaults.id, vault.id)); return { success: true }; }); }),
    schedules: protectedProcedure.query(async ({ ctx }) => { const db = await getDb(); return db ? db.select().from(recurringSchedules).where(eq(recurringSchedules.userId, ctx.user.id)).orderBy(desc(recurringSchedules.createdAt)) : []; }),
    schedule: protectedProcedure.input(z.object({ kind: z.enum(["vault_transfer", "deposit"]), vaultId: z.number().optional(), currency: asset, amount: money, frequency: z.enum(["daily", "weekly", "monthly"]), paymentMethodToken: z.string().max(256).optional() })).mutation(async ({ ctx, input }) => { if (input.kind === "deposit" && !input.paymentMethodToken) throw new TRPCError({ code: "BAD_REQUEST", message: "A saved payment method is required" }); const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" }); await db.insert(recurringSchedules).values({ ...input, userId: ctx.user.id, nextRunAt: nextScheduleDate(input.frequency) }); return { success: true }; }),
    setScheduleStatus: protectedProcedure.input(z.object({ id: z.number(), status: z.enum(["active", "paused", "cancelled"]) })).mutation(async ({ ctx, input }) => { const db = await getDb(); if (db) await db.update(recurringSchedules).set({ status: input.status }).where(and(eq(recurringSchedules.id, input.id), eq(recurringSchedules.userId, ctx.user.id))); return { success: true }; }),
  }),
  support: router({
    list: protectedProcedure.query(async ({ ctx }) => { const db = await getDb(); return db ? db.select().from(supportTickets).where(eq(supportTickets.userId, ctx.user.id)).orderBy(desc(supportTickets.updatedAt)) : []; }),
    messages: protectedProcedure.input(z.object({ ticketId: z.number() })).query(async ({ ctx, input }) => { const db = await getDb(); if (!db) return []; const [ticket] = await db.select().from(supportTickets).where(and(eq(supportTickets.id, input.ticketId), eq(supportTickets.userId, ctx.user.id))).limit(1); if (!ticket) throw new TRPCError({ code: "NOT_FOUND" }); return db.select().from(supportTicketMessages).where(eq(supportTicketMessages.ticketId, input.ticketId)).orderBy(supportTicketMessages.createdAt); }),
    create: protectedProcedure.input(z.object({ subject: safeText(3, 256), category: z.enum(["account", "deposit", "withdrawal", "trading", "kyc", "technical", "general"]), priority: z.enum(["low", "normal", "high", "urgent"]).default("normal"), message: safeText(10, 5000), attachmentUrl: secureUploadUrl.optional() })).mutation(async ({ ctx, input }) => { const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" }); return db.transaction(async (tx) => { const [ticket] = await tx.insert(supportTickets).values({ userId: ctx.user.id, subject: input.subject, category: input.category, priority: input.priority }).$returningId(); await tx.insert(supportTicketMessages).values({ ticketId: ticket.id, senderUserId: ctx.user.id, body: input.message, attachmentUrl: input.attachmentUrl }); return { ticketId: ticket.id }; }); }),
    reply: protectedProcedure.input(z.object({ ticketId: z.number(), message: safeText(1, 5000), attachmentUrl: secureUploadUrl.optional() })).mutation(async ({ ctx, input }) => { const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" }); const [ticket] = await db.select().from(supportTickets).where(and(eq(supportTickets.id, input.ticketId), eq(supportTickets.userId, ctx.user.id))).limit(1); if (!ticket) throw new TRPCError({ code: "NOT_FOUND" }); await db.transaction(async (tx) => { await tx.insert(supportTicketMessages).values({ ticketId: ticket.id, senderUserId: ctx.user.id, body: input.message, attachmentUrl: input.attachmentUrl }); await tx.update(supportTickets).set({ status: "waiting_support" }).where(eq(supportTickets.id, ticket.id)); }); return { success: true }; }),
  }),
  push: router({
    publicKey: publicProcedure.query(() => ({ publicKey: process.env.VAPID_PUBLIC_KEY ?? null })),
    subscribe: protectedProcedure.input(z.object({ endpoint: z.string().url().max(2000), keys: z.object({ p256dh: z.string().min(20).max(512), auth: z.string().min(8).max(256) }) })).mutation(async ({ ctx, input }) => { const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" }); await db.insert(pushSubscriptions).values({ userId: ctx.user.id, endpoint: input.endpoint, endpointHash: hash(input.endpoint), p256dh: input.keys.p256dh, auth: input.keys.auth }).onDuplicateKeyUpdate({ set: { userId: ctx.user.id, p256dh: input.keys.p256dh, auth: input.keys.auth } }); return { success: true }; }),
    unsubscribe: protectedProcedure.input(z.object({ endpoint: z.string().url() })).mutation(async ({ ctx, input }) => { const db = await getDb(); if (db) await db.delete(pushSubscriptions).where(and(eq(pushSubscriptions.userId, ctx.user.id), eq(pushSubscriptions.endpointHash, hash(input.endpoint)))); return { success: true }; }),
  }),
  trustedIps: router({
    list: protectedProcedure.query(async ({ ctx }) => { const db = await getDb(); return db ? db.select().from(trustedWithdrawalIps).where(eq(trustedWithdrawalIps.userId, ctx.user.id)).orderBy(desc(trustedWithdrawalIps.createdAt)) : []; }),
    current: protectedProcedure.query(({ ctx }) => ({ ipAddress: getClientIp(ctx.req) })),
    add: protectedProcedure.input(z.object({ ipAddress: z.union([z.ipv4(), z.ipv6()]), label: safeText(1, 128).optional(), emailCode: z.string().length(6) })).mutation(async ({ ctx, input }) => { const user = await getUserById(ctx.user.id); if (!user?.email) throw new TRPCError({ code: "BAD_REQUEST", message: "A verified email is required" }); const result = await verifyOtp(user.email, input.emailCode); if (!result.valid) throw new TRPCError({ code: "BAD_REQUEST", message: result.reason ?? "Invalid verification code" }); const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" }); await db.insert(trustedWithdrawalIps).values({ userId: ctx.user.id, ipAddress: input.ipAddress, label: input.label, verifiedAt: new Date() }).onDuplicateKeyUpdate({ set: { label: input.label, verifiedAt: new Date() } }); return { success: true }; }),
    remove: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => { const db = await getDb(); if (db) await db.delete(trustedWithdrawalIps).where(and(eq(trustedWithdrawalIps.id, input.id), eq(trustedWithdrawalIps.userId, ctx.user.id))); return { success: true }; }),
  }),
  analytics: router({
    portfolio: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb(); if (!db) return { volume: 0, realizedGains: 0, maxDrawdown: 0, sharpeRatio: 0, allocation: [], allocationDrift: [] };
      const txRows = await db.select().from(transactions).where(eq(transactions.userId, ctx.user.id)).orderBy(transactions.createdAt); const walletRows = await db.select().from(wallets).where(eq(wallets.userId, ctx.user.id));
      const returns = txRows.map((row) => (["receive", "deposit", "sell"].includes(row.type) ? 1 : -1) * Number(row.amount)); const average = returns.length ? returns.reduce((a, b) => a + b, 0) / returns.length : 0; const variance = returns.length ? returns.reduce((sumValue, value) => sumValue + (value - average) ** 2, 0) / returns.length : 0;
      let peak = 0; let equity = 0; let maxDrawdown = 0; for (const value of returns) { equity += value; peak = Math.max(peak, equity); if (peak > 0) maxDrawdown = Math.max(maxDrawdown, (peak - equity) / peak); }
      const allocation = walletRows.filter((wallet) => Number(wallet.balance) > 0).map((wallet) => ({ asset: wallet.currency, amount: Number(wallet.balance) })); const allocationTotal = allocation.reduce((total, item) => total + item.amount, 0); const targetPercent = allocation.length ? 100 / allocation.length : 0;
      const allocationDrift = allocation.map((item) => ({ asset: item.asset, currentPercent: allocationTotal ? item.amount / allocationTotal * 100 : 0, targetPercent, driftPercent: allocationTotal ? item.amount / allocationTotal * 100 - targetPercent : 0 }));
      return { volume: returns.reduce((sumValue, value) => sumValue + Math.abs(value), 0), realizedGains: returns.reduce((a, b) => a + b, 0), maxDrawdown: maxDrawdown * 100, sharpeRatio: variance ? average / Math.sqrt(variance) : 0, allocation, allocationDrift };
    }),
    taxReport: protectedProcedure.input(z.object({ year: z.number().int().min(2000).max(2100), jurisdiction: z.string().min(2).max(64) })).query(async ({ ctx, input }) => {
      const db = await getDb(); if (!db) return { csv: "", summary: { proceeds: 0, costBasis: 0, gainLoss: 0 }, jurisdiction: input.jurisdiction };
      const start = new Date(`${input.year}-01-01T00:00:00Z`); const end = new Date(`${input.year + 1}-01-01T00:00:00Z`);
      const rows = await db.select().from(transactions).where(and(eq(transactions.userId, ctx.user.id), gt(transactions.createdAt, start), lte(transactions.createdAt, end), eq(transactions.status, "confirmed"))).orderBy(transactions.createdAt);
      const disposals = calculateFifoCapitalGains(rows);
      const csvRows = [["Transaction ID", "Date", "Asset", "Quantity", "Proceeds USD", "FIFO Cost Basis USD", "Gain/Loss USD", "Jurisdiction"], ...disposals.map((row) => [row.transactionId, row.date, row.asset, row.quantity, row.proceeds.toFixed(2), row.costBasis.toFixed(2), row.gainLoss.toFixed(2), input.jurisdiction])];
      const summary = disposals.reduce((total, row) => ({ proceeds: total.proceeds + row.proceeds, costBasis: total.costBasis + row.costBasis, gainLoss: total.gainLoss + row.gainLoss }), { proceeds: 0, costBasis: 0, gainLoss: 0 });
      return { csv: csvRows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n"), summary, jurisdiction: input.jurisdiction };
    }),
  }),
  loyalty: router({ status: protectedProcedure.query(async ({ ctx }) => recalculateLoyaltyTier(ctx.user.id)) }),
  apiKeys: router({
    list: protectedProcedure.query(async ({ ctx }) => { const db = await getDb(); if (!db) return []; const rows = await db.select().from(apiKeys).where(eq(apiKeys.userId, ctx.user.id)).orderBy(desc(apiKeys.createdAt)); return rows.map(({ keyHash, ...row }) => row); }),
    create: protectedProcedure.input(z.object({ name: safeText(1, 128), scopes: z.array(z.enum(["read", "trade", "withdraw"])).min(1), expiresAt: z.coerce.date().optional() })).mutation(async ({ ctx, input }) => { const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" }); const raw = `gv_${randomSecret(32)}`; const [row] = await db.insert(apiKeys).values({ userId: ctx.user.id, name: input.name, scopes: input.scopes, expiresAt: input.expiresAt, keyPrefix: raw.slice(0, 12), keyHash: hash(raw) }).$returningId(); return { id: row.id, apiKey: raw }; }),
    revoke: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => { const db = await getDb(); if (db) await db.update(apiKeys).set({ revokedAt: new Date() }).where(and(eq(apiKeys.id, input.id), eq(apiKeys.userId, ctx.user.id))); return { success: true }; }),
  }),
  agreements: router({
    create: protectedProcedure.input(z.object({ planId: z.string().max(64), amount: money, currency: asset })).mutation(async ({ ctx, input }) => { if (Number(input.amount) <= 10_000) return { required: false, agreementId: null, terms: null }; const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" }); const terms = `GoldVaults Premium Investment Agreement v1. Amount: ${input.amount} ${input.currency}. The investor acknowledges market risk, custody terms, lock period, fees, and applicable law.`; const [row] = await db.insert(investmentAgreements).values({ ...input, userId: ctx.user.id, termsVersion: "1.0", documentHash: hash(terms), expiresAt: new Date(Date.now() + 24 * 60 * 60_000) }).$returningId(); return { required: true, agreementId: row.id, terms }; }),
    sign: protectedProcedure.input(z.object({ agreementId: z.number(), signatureName: safeText(2, 128), accepted: z.literal(true) })).mutation(async ({ ctx, input }) => { const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" }); await db.update(investmentAgreements).set({ signatureName: input.signatureName, signedIp: getClientIp(ctx.req), signedAt: new Date() }).where(and(eq(investmentAgreements.id, input.agreementId), eq(investmentAgreements.userId, ctx.user.id), gt(investmentAgreements.expiresAt, new Date()))); return { success: true }; }),
  }),
  affiliate: router({
    dashboard: protectedProcedure.query(async ({ ctx }) => { const db = await getDb(); if (!db) return null; const [profile] = await db.select().from(affiliateProfiles).where(eq(affiliateProfiles.userId, ctx.user.id)).limit(1); if (!profile) return null; const children = await db.select().from(affiliateProfiles).where(eq(affiliateProfiles.parentAffiliateId, profile.id)); const payouts = await db.select().from(affiliatePayouts).where(eq(affiliatePayouts.affiliateId, profile.id)).orderBy(desc(affiliatePayouts.requestedAt)); return { profile, children, payouts, materials: [{ name: "GoldVaults Partner Media Kit", url: "/assets/partner-media-kit.pdf" }, { name: "Referral Landing Page", url: `/ref/${ctx.user.referralCode ?? ""}` }] }; }),
    applyProgram: protectedProcedure.mutation(async ({ ctx }) => { const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" }); await db.insert(affiliateProfiles).values({ userId: ctx.user.id }).onDuplicateKeyUpdate({ set: { status: "pending" } }); await db.update(users).set({ affiliateStatus: "pending" }).where(eq(users.id, ctx.user.id)); return { success: true }; }),
    requestPayout: protectedProcedure.input(z.object({ amount: money, currency: asset.default("USD") })).mutation(async ({ ctx, input }) => { const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" }); const [profile] = await db.select().from(affiliateProfiles).where(and(eq(affiliateProfiles.userId, ctx.user.id), eq(affiliateProfiles.status, "approved"))).limit(1); if (!profile || Number(profile.payoutBalance) < Number(input.amount)) throw new TRPCError({ code: "BAD_REQUEST", message: "Insufficient affiliate payout balance" }); await db.insert(affiliatePayouts).values({ affiliateId: profile.id, amount: input.amount, currency: input.currency }); return { success: true }; }),
  }),
  blog: router({
    list: publicProcedure.input(z.object({ search: z.string().max(128).optional(), limit: z.number().min(1).max(100).default(20) }).optional()).query(async ({ input }) => { const db = await getDb(); if (!db) return []; const rows = await db.select().from(blogPosts).where(eq(blogPosts.status, "published")).orderBy(desc(blogPosts.publishedAt)).limit(input?.limit ?? 20); if (!input?.search) return rows; const query = input.search.toLowerCase(); return rows.filter((post) => post.title.toLowerCase().includes(query) || post.excerpt.toLowerCase().includes(query)); }),
    bySlug: publicProcedure.input(z.object({ slug: z.string().regex(/^[a-z0-9-]+$/) })).query(async ({ input }) => { const db = await getDb(); if (!db) return null; const [post] = await db.select().from(blogPosts).where(and(eq(blogPosts.slug, input.slug), eq(blogPosts.status, "published"))).limit(1); return post ?? null; }),
  }),
  admin: router({
    aml: router({ list: adminProcedure.input(z.object({ status: z.enum(["open", "reviewing", "cleared", "reported"]).optional() }).optional()).query(async ({ input }) => { const db = await getDb(); if (!db) return []; return db.select().from(amlAlerts).where(input?.status ? eq(amlAlerts.status, input.status) : undefined).orderBy(desc(amlAlerts.createdAt)).limit(250); }), fileSar: adminProcedure.input(z.object({ alertId: z.number(), jurisdiction: safeText(2, 64), narrative: safeText(50, 10000), reference: safeText(1, 128).optional() })).mutation(async ({ ctx, input }) => { const db = await getDb(); if (!db || !ctx.adminSession?.adminId) throw new TRPCError({ code: "BAD_REQUEST" }); await db.transaction(async (tx) => { await tx.insert(suspiciousActivityReports).values({ ...input, filedByAdminId: ctx.adminSession!.adminId }); await tx.update(amlAlerts).set({ status: "reported", reviewedAt: new Date() }).where(eq(amlAlerts.id, input.alertId)); }); return { success: true }; }) }),
    webhooks: router({ list: adminProcedure.query(async () => { const db = await getDb(); if (!db) return []; const rows = await db.select().from(webhookEndpoints).orderBy(desc(webhookEndpoints.createdAt)); return rows.map(({ secret, ...endpoint }) => endpoint); }), create: adminProcedure.input(z.object({ name: safeText(1, 128), url: z.string().url().refine((value) => value.startsWith("https://")), events: z.array(z.enum(["deposit.created", "deposit.confirmed", "kyc.approved", "withdrawal.large", "investment.matured"])).min(1) })).mutation(async ({ input }) => { const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" }); const secret = randomSecret(); const [row] = await db.insert(webhookEndpoints).values({ ...input, secret }).$returningId(); return { id: row.id, secret }; }), remove: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => { const db = await getDb(); if (db) await db.delete(webhookEndpoints).where(eq(webhookEndpoints.id, input.id)); return { success: true }; }) }),
    tickets: router({ list: adminProcedure.query(async () => { const db = await getDb(); return db ? db.select().from(supportTickets).orderBy(desc(supportTickets.updatedAt)).limit(250) : []; }), reply: adminProcedure.input(z.object({ ticketId: z.number(), message: safeText(1, 5000), status: z.enum(["open", "waiting_user", "resolved", "closed"]).default("waiting_user") })).mutation(async ({ ctx, input }) => { const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" }); await db.transaction(async (tx) => { await tx.insert(supportTicketMessages).values({ ticketId: input.ticketId, senderAdminId: ctx.adminSession?.adminId ?? ctx.user?.id, body: input.message }); await tx.update(supportTickets).set({ status: input.status }).where(eq(supportTickets.id, input.ticketId)); }); return { success: true }; }) }),
    blog: router({ list: adminProcedure.query(async () => { const db = await getDb(); return db ? db.select().from(blogPosts).orderBy(desc(blogPosts.createdAt)) : []; }), upsert: adminProcedure.input(z.object({ id: z.number().optional(), title: safeText(3, 256), slug: z.string().regex(/^[a-z0-9-]{3,256}$/), excerpt: safeText(10, 1000), content: safeText(20, 100000), categoryId: z.number().optional(), coverImageUrl: publicCmsAssetUrl.optional(), seoTitle: safeText(3, 256).optional(), seoDescription: safeText(10, 320).optional(), status: z.enum(["draft", "published", "archived"]) })).mutation(async ({ ctx, input }) => { const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" }); const { id, ...data } = input; const values = { ...data, authorAdminId: ctx.adminSession?.adminId ?? ctx.user?.id ?? 0, publishedAt: data.status === "published" ? new Date() : null }; if (id) await db.update(blogPosts).set(values).where(eq(blogPosts.id, id)); else await db.insert(blogPosts).values(values); return { success: true }; }), categories: adminProcedure.query(async () => { const db = await getDb(); return db ? db.select().from(blogCategories) : []; }), addCategory: adminProcedure.input(z.object({ name: safeText(2, 128), slug: z.string().regex(/^[a-z0-9-]+$/) })).mutation(async ({ input }) => { const db = await getDb(); if (db) await db.insert(blogCategories).values(input); return { success: true }; }) }),
    p2pDisputes: router({ list: adminProcedure.query(async () => { const db = await getDb(); return db ? db.select().from(p2pDisputes).where(or(eq(p2pDisputes.status, "open"), eq(p2pDisputes.status, "reviewing"))).orderBy(p2pDisputes.createdAt) : []; }), resolve: adminProcedure.input(z.object({ disputeId: z.number(), decision: z.enum(["buyer", "seller"]), resolution: safeText(10, 3000) })).mutation(async ({ ctx, input }) => { const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" }); return db.transaction(async (tx) => { const [dispute] = await tx.select().from(p2pDisputes).where(eq(p2pDisputes.id, input.disputeId)).limit(1); if (!dispute || !["open", "reviewing"].includes(dispute.status)) throw new TRPCError({ code: "BAD_REQUEST" }); const [order] = await tx.select().from(p2pOrders).where(eq(p2pOrders.id, dispute.orderId)).limit(1); if (!order || order.status !== "disputed") throw new TRPCError({ code: "BAD_REQUEST" }); const recipientId = input.decision === "buyer" ? order.buyerId : order.sellerId; await creditWallet(tx, recipientId, order.asset, Number(order.amount)); await tx.update(p2pOrders).set({ status: input.decision === "buyer" ? "released" : "refunded" }).where(eq(p2pOrders.id, order.id)); await tx.update(p2pDisputes).set({ status: input.decision === "buyer" ? "resolved_buyer" : "resolved_seller", resolution: input.resolution, resolvedByAdminId: ctx.adminSession?.adminId ?? ctx.user?.id, resolvedAt: new Date() }).where(eq(p2pDisputes.id, dispute.id)); return { success: true }; }); }) }),
    affiliates: router({ list: adminProcedure.query(async () => { const db = await getDb(); return db ? db.select().from(affiliateProfiles).orderBy(desc(affiliateProfiles.createdAt)) : []; }), setStatus: adminProcedure.input(z.object({ id: z.number(), status: z.enum(["pending", "approved", "suspended"]) })).mutation(async ({ input }) => { const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" }); const [profile] = await db.select().from(affiliateProfiles).where(eq(affiliateProfiles.id, input.id)).limit(1); if (!profile) throw new TRPCError({ code: "NOT_FOUND" }); await db.transaction(async (tx) => { await tx.update(affiliateProfiles).set({ status: input.status }).where(eq(affiliateProfiles.id, input.id)); await tx.update(users).set({ affiliateStatus: input.status }).where(eq(users.id, profile.userId)); }); return { success: true }; }), payouts: adminProcedure.query(async () => { const db = await getDb(); return db ? db.select().from(affiliatePayouts).where(eq(affiliatePayouts.status, "requested")).orderBy(affiliatePayouts.requestedAt) : []; }), approvePayout: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => { const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" }); await db.update(affiliatePayouts).set({ status: "approved", processedAt: new Date() }).where(and(eq(affiliatePayouts.id, input.id), eq(affiliatePayouts.status, "requested"))); return { success: true }; }) }),
    cards: router({ pending: adminProcedure.query(async () => { const db = await getDb(); return db ? db.select().from(nfcCards).where(eq(nfcCards.issuanceStatus, "pending")).orderBy(nfcCards.createdAt) : []; }), decide: adminProcedure.input(z.object({ id: z.number(), status: z.enum(["issued", "rejected"]) })).mutation(async ({ input }) => { const db = await getDb(); if (db) await db.update(nfcCards).set({ issuanceStatus: input.status, isActive: input.status === "issued" }).where(eq(nfcCards.id, input.id)); return { success: true }; }) }),
  }),
});

export async function authenticateApiKey(rawKey: string, requiredScope: "read" | "trade" | "withdraw" = "read") {
  const db = await getDb(); if (!db) return null;
  const [row] = await db.select().from(apiKeys).where(and(eq(apiKeys.keyHash, hash(rawKey)), isNull(apiKeys.revokedAt), or(isNull(apiKeys.expiresAt), gt(apiKeys.expiresAt, new Date())))).limit(1);
  if (!row || !row.scopes.includes(requiredScope)) return null;
  await db.update(apiKeys).set({ lastUsedAt: new Date() }).where(eq(apiKeys.id, row.id));
  return row;
}

export async function processRecurringSchedules() {
  const db = await getDb(); if (!db) return 0;
  const due = await db.select().from(recurringSchedules).where(and(eq(recurringSchedules.status, "active"), lte(recurringSchedules.nextRunAt, new Date()))).limit(100);
  let processed = 0;
  for (const schedule of due) {
    if (schedule.kind === "vault_transfer" && schedule.vaultId) {
      try { await db.transaction(async (tx) => { const [vault] = await tx.select().from(savingsVaults).where(and(eq(savingsVaults.id, schedule.vaultId!), eq(savingsVaults.userId, schedule.userId))).limit(1); if (!vault) throw new Error("Vault missing"); await debitWallet(tx, schedule.userId, schedule.currency, Number(schedule.amount)); await tx.update(savingsVaults).set({ balance: (Number(vault.balance) + Number(schedule.amount)).toFixed(8) }).where(eq(savingsVaults.id, vault.id)); }); processed += 1; } catch { /* retry next cycle */ }
    } else {
      // External processors charge the saved token; we record a pending instruction for their worker.
      await db.insert(transactions).values({ userId: schedule.userId, type: "deposit", currency: schedule.currency, amount: schedule.amount, status: "pending", note: "Scheduled deposit", metadata: { scheduleId: schedule.id, paymentMethodToken: schedule.paymentMethodToken } }); processed += 1;
    }
    await db.update(recurringSchedules).set({ lastRunAt: new Date(), nextRunAt: nextScheduleDate(schedule.frequency) }).where(eq(recurringSchedules.id, schedule.id));
  }
  return processed;
}

export async function processMaturedStakes() {
  const db = await getDb(); if (!db) return 0;
  const matured = await db.select({ id: stakingPositions.id }).from(stakingPositions).where(and(eq(stakingPositions.status, "active"), lte(stakingPositions.unlocksAt, new Date()))).limit(100);
  let processed = 0;
  for (const candidate of matured) {
    await db.transaction(async (tx) => {
      await tx.execute(sql`SELECT ${stakingPositions.id} FROM ${stakingPositions} WHERE ${stakingPositions.id} = ${candidate.id} FOR UPDATE`);
      const [position] = await tx.select().from(stakingPositions).where(eq(stakingPositions.id, candidate.id)).limit(1);
      if (!position || position.status !== "active" || position.unlocksAt > new Date()) return;
      const redemption = calculateStakingRedemption(position);
      if (position.autoCompound) {
        const compounded = Number(position.amount) + redemption.yieldEarned;
        await tx.update(stakingPositions).set({ amount: compounded.toFixed(8), accruedYield: (Number(position.accruedYield) + redemption.yieldEarned).toFixed(8), startsAt: new Date(), unlocksAt: new Date(Date.now() + position.durationDays * 86_400_000) }).where(eq(stakingPositions.id, position.id));
      } else {
        await creditWallet(tx, position.userId, position.asset, redemption.payout);
        await tx.update(stakingPositions).set({ status: "completed", accruedYield: redemption.yieldEarned.toFixed(8), endedAt: new Date() }).where(eq(stakingPositions.id, position.id));
        await tx.insert(notifications).values({ userId: position.userId, type: "system", title: "Stake matured", body: `${redemption.payout.toFixed(8)} ${position.asset} was credited to your wallet.`, icon: "trending-up" });
      }
      processed += 1;
    });
  }
  return processed;
}

export async function processExpiredP2pOrders() {
  const db = await getDb(); if (!db) return 0;
  const expired = await db.select({ id: p2pOrders.id }).from(p2pOrders).where(and(eq(p2pOrders.status, "escrowed"), lte(p2pOrders.expiresAt, new Date()))).limit(100); let processed = 0;
  for (const candidate of expired) await db.transaction(async (tx) => {
    await tx.execute(sql`SELECT ${p2pOrders.id} FROM ${p2pOrders} WHERE ${p2pOrders.id} = ${candidate.id} FOR UPDATE`);
    const [order] = await tx.select().from(p2pOrders).where(eq(p2pOrders.id, candidate.id)).limit(1); if (!order || order.status !== "escrowed" || order.expiresAt > new Date()) return;
    await creditWallet(tx, order.sellerId, order.asset, Number(order.amount));
    const [offer] = await tx.select().from(p2pOffers).where(eq(p2pOffers.id, order.offerId)).limit(1);
    if (offer) await tx.update(p2pOffers).set({ availableAmount: (Number(offer.availableAmount) + Number(order.amount)).toFixed(8), status: "active" }).where(eq(p2pOffers.id, offer.id));
    await tx.update(p2pOrders).set({ status: "cancelled" }).where(eq(p2pOrders.id, order.id)); processed += 1;
  });
  return processed;
}

export function startAdvancedFinancialHeartbeat() {
  const run = () => Promise.all([processRecurringSchedules(), processMaturedStakes(), processExpiredP2pOrders()]).catch((error) => console.error("[Advanced heartbeat]", error));
  void run();
  const timer = setInterval(() => void run(), 60_000);
  timer.unref();
  return () => clearInterval(timer);
}
