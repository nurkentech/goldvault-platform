import { and, desc, eq, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser, InsertAddressBookEntry, InsertChatMessage, InsertMintingRecord,
  InsertNfcCard, InsertNotification, InsertPriceAlert, InsertSocialPost,
  InsertTransaction, InsertWallet,
  addressBook, challenges, chatMessages, mintingRecords, nfcCards,
  notifications, priceAlerts, socialPosts, transactions, userChallenges, users, wallets,
  investments, kycDocuments, InsertInvestment,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try { _db = drizzle(process.env.DATABASE_URL); }
    catch (e) { console.warn("[Database] Failed to connect:", e); _db = null; }
  }
  return _db;
}

// ─── Users ────────────────────────────────────────────────────────────────────
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;
  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const fields = ["name", "email", "phone", "avatarUrl", "loginMethod", "username"] as const;
  for (const f of fields) {
    const v = (user as Record<string, unknown>)[f];
    if (v !== undefined) { (values as Record<string, unknown>)[f] = v ?? null; updateSet[f] = v ?? null; }
  }
  if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
  const role = user.openId === ENV.ownerOpenId ? "admin" : (user.role ?? "user");
  values.role = role; updateSet.role = role;
  if (!values.lastSignedIn) { values.lastSignedIn = new Date(); updateSet.lastSignedIn = values.lastSignedIn; }
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  const [storedUser] = await db.select().from(users).where(eq(users.openId, user.openId)).limit(1);
  if (storedUser && !storedUser.referralCode) {
    const referralCode = `GV${storedUser.id.toString(36).toUpperCase().padStart(8, "0")}`;
    await db.update(users).set({ referralCode }).where(eq(users.id, storedUser.id));
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const r = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return r[0];
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const r = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return r[0];
}

export async function updateUserProfile(userId: number, data: {
  name?: string;
  username?: string;
  phone?: string;
  avatarUrl?: string;
  bio?: string;
  country?: string;
  preferredCurrency?: "USD" | "EUR" | "GBP" | "NGN";
  preferredLanguage?: "en" | "fr" | "es" | "ar" | "pt";
  themePreference?: "light" | "dark" | "system";
}) {
  const db = await getDb();
  if (!db) return;
  const clean: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(data)) { if (v !== undefined) clean[k] = v; }
  if (Object.keys(clean).length === 0) return;
  await db.update(users).set(clean).where(eq(users.id, userId));
}

export async function updateNotifPrefs(userId: number, prefs: {
  priceAlerts?: boolean;
  portfolioUpdates?: boolean;
  newsDigest?: boolean;
  securityAlerts?: boolean;
  marketingEmails?: boolean;
}) {
  const db = await getDb();
  if (!db) return;
  const user = await getUserById(userId);
  if (!user) return;
  const current = (user.notifPrefs ?? { priceAlerts: true, portfolioUpdates: true, newsDigest: false, securityAlerts: true, marketingEmails: false }) as Record<string, boolean>;
  const merged = { ...current, ...(prefs as Record<string, boolean>) } as { priceAlerts: boolean; portfolioUpdates: boolean; newsDigest: boolean; securityAlerts: boolean; marketingEmails: boolean };
  await db.update(users).set({ notifPrefs: merged }).where(eq(users.id, userId));
}

export async function updateKycStatus(userId: number, status: "unverified" | "pending" | "verified" | "rejected") {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ kycStatus: status }).where(eq(users.id, userId));
}

export async function toggle2FA(userId: number, enabled: boolean) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ twoFactorEnabled: enabled }).where(eq(users.id, userId));
}

export async function updateUserGoldCoins(userId: number, delta: number) {
  const db = await getDb();
  if (!db) return 0;
  const user = await getUserById(userId);
  if (!user) return 0;
  const newBalance = Math.max(0, user.goldCoins + delta);
  await db.update(users).set({ goldCoins: newBalance }).where(eq(users.id, userId));
  return newBalance;
}

export async function getLeaderboard(limit = 20) {
  const db = await getDb();
  if (!db) return [];
  return db.select({ id: users.id, name: users.name, username: users.username, avatarUrl: users.avatarUrl, goldCoins: users.goldCoins, tier: users.tier, totalPoints: users.totalPoints }).from(users).orderBy(desc(users.goldCoins)).limit(limit);
}

// ─── Wallets ──────────────────────────────────────────────────────────────────
export async function getUserWallets(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(wallets).where(eq(wallets.userId, userId));
}

export async function initDefaultWallets(userId: number) {
  const db = await getDb();
  if (!db) return;
  const currencies = ["BTC", "ETH", "SOL", "GOLD", "USDC", "GVT", "PAXG", "XAUT"];
  for (const currency of currencies) {
    const existing = await db.select().from(wallets).where(and(eq(wallets.userId, userId), eq(wallets.currency, currency))).limit(1);
    if (existing.length === 0) await db.insert(wallets).values({ userId, currency, balance: "0" });
  }
}

// ─── Transactions ─────────────────────────────────────────────────────────────
export async function getUserTransactions(userId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(transactions).where(or(eq(transactions.userId, userId), eq(transactions.toUserId, userId))).orderBy(desc(transactions.createdAt)).limit(limit);
}

export async function createTransaction(data: InsertTransaction) {
  const db = await getDb();
  if (!db) return null;
  return db.insert(transactions).values(data);
}

// ─── Address Book ─────────────────────────────────────────────────────────────
export async function getUserAddressBook(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(addressBook).where(eq(addressBook.userId, userId)).orderBy(desc(addressBook.isFavorite), desc(addressBook.useCount));
}

export async function createAddressBookEntry(data: InsertAddressBookEntry) {
  const db = await getDb();
  if (!db) return null;
  return db.insert(addressBook).values(data);
}

export async function updateAddressBookEntry(id: number, userId: number, data: Partial<InsertAddressBookEntry>) {
  const db = await getDb();
  if (!db) return;
  await db.update(addressBook).set({ ...data, updatedAt: new Date() }).where(and(eq(addressBook.id, id), eq(addressBook.userId, userId)));
}

export async function deleteAddressBookEntry(id: number, userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(addressBook).where(and(eq(addressBook.id, id), eq(addressBook.userId, userId)));
}

// ─── Notifications ────────────────────────────────────────────────────────────
export async function getUserNotifications(userId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt)).limit(limit);
}

export async function createNotification(data: InsertNotification) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(notifications).values(data);
  void import("./pushNotifications").then(({ sendPushToUser }) => sendPushToUser(data.userId, {
    title: data.title,
    body: data.body,
    url: data.actionUrl ?? "/dashboard/notifications",
    tag: `${data.type}-${Date.now()}`,
  })).catch((error) => console.error("[Push] Delivery failed:", error));
  return result;
}

export async function markNotificationRead(id: number, userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(notifications).set({ isRead: true }).where(and(eq(notifications.id, id), eq(notifications.userId, userId)));
}

export async function markAllNotificationsRead(userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(notifications).set({ isRead: true }).where(eq(notifications.userId, userId));
}

export async function clearAllNotifications(userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(notifications).where(eq(notifications.userId, userId));
}

// ─── Challenges ───────────────────────────────────────────────────────────────
export async function getActiveChallenges() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(challenges).where(eq(challenges.isActive, true));
}

export async function getUserChallengeProgress(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select({ id: userChallenges.id, userId: userChallenges.userId, challengeId: userChallenges.challengeId, progress: userChallenges.progress, isCompleted: userChallenges.isCompleted, claimedAt: userChallenges.claimedAt, challenge: challenges }).from(userChallenges).innerJoin(challenges, eq(userChallenges.challengeId, challenges.id)).where(eq(userChallenges.userId, userId));
}

export async function claimChallengeReward(userId: number, challengeId: number) {
  const db = await getDb();
  if (!db) return null;
  const uc = await db.select().from(userChallenges).where(and(eq(userChallenges.userId, userId), eq(userChallenges.challengeId, challengeId))).limit(1);
  if (!uc[0] || uc[0].claimedAt) return null;
  const ch = await db.select().from(challenges).where(eq(challenges.id, challengeId)).limit(1);
  if (!ch[0]) return null;
  await db.update(userChallenges).set({ claimedAt: new Date() }).where(and(eq(userChallenges.userId, userId), eq(userChallenges.challengeId, challengeId)));
  const newBalance = await updateUserGoldCoins(userId, ch[0].reward);
  return { reward: ch[0].reward, newBalance };
}

// ─── Social ───────────────────────────────────────────────────────────────────
export async function getCommunityFeed(limit = 30) {
  const db = await getDb();
  if (!db) return [];
  return db.select({ id: socialPosts.id, content: socialPosts.content, mediaUrl: socialPosts.mediaUrl, mediaType: socialPosts.mediaType, platform: socialPosts.platform, likes: socialPosts.likes, shares: socialPosts.shares, goldCoinsEarned: socialPosts.goldCoinsEarned, createdAt: socialPosts.createdAt, authorName: users.name, authorUsername: users.username, authorAvatar: users.avatarUrl }).from(socialPosts).innerJoin(users, eq(socialPosts.userId, users.id)).orderBy(desc(socialPosts.createdAt)).limit(limit);
}

export async function createSocialPost(data: InsertSocialPost) {
  const db = await getDb();
  if (!db) return null;
  return db.insert(socialPosts).values(data);
}

// ─── Chat ─────────────────────────────────────────────────────────────────────
export async function getChatHistory(userId: number, otherUserId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(chatMessages).where(or(and(eq(chatMessages.fromUserId, userId), eq(chatMessages.toUserId, otherUserId)), and(eq(chatMessages.fromUserId, otherUserId), eq(chatMessages.toUserId, userId)))).orderBy(desc(chatMessages.createdAt)).limit(limit);
}

export async function sendChatMessage(data: InsertChatMessage) {
  const db = await getDb();
  if (!db) return null;
  return db.insert(chatMessages).values(data);
}

// ─── Minting ──────────────────────────────────────────────────────────────────
export async function getUserMintingHistory(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(mintingRecords).where(eq(mintingRecords.userId, userId)).orderBy(desc(mintingRecords.createdAt));
}

export async function createMintingRecord(data: InsertMintingRecord) {
  const db = await getDb();
  if (!db) return null;
  return db.insert(mintingRecords).values(data);
}

// ─── NFC Cards ────────────────────────────────────────────────────────────────
export async function getUserNfcCards(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(nfcCards).where(eq(nfcCards.userId, userId));
}

export async function createNfcCard(data: InsertNfcCard) {
  const db = await getDb();
  if (!db) return null;
  return db.insert(nfcCards).values(data);
}

export async function updateNfcCard(id: number, userId: number, data: Partial<InsertNfcCard>) {
  const db = await getDb();
  if (!db) return;
  await db.update(nfcCards).set({ ...data, updatedAt: new Date() }).where(and(eq(nfcCards.id, id), eq(nfcCards.userId, userId)));
}

// ─── Price Alerts ─────────────────────────────────────────────────────────────
export async function getUserPriceAlerts(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(priceAlerts).where(eq(priceAlerts.userId, userId));
}

export async function createPriceAlert(data: InsertPriceAlert) {
  const db = await getDb();
  if (!db) return null;
  return db.insert(priceAlerts).values(data);
}

export async function deletePriceAlert(id: number, userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(priceAlerts).where(and(eq(priceAlerts.id, id), eq(priceAlerts.userId, userId)));
}

// ─── KYC Documents ──────────────────────────────────────────────────────────────
export async function submitKycDocuments(userId: number, data: {
  documentType: "passport" | "drivers_license" | "national_id";
  documentFrontUrl: string;
  documentBackUrl?: string;
  selfieUrl: string;
  proofOfAddressUrl?: string;
}) {
  const db = await getDb();
  if (!db) return;
  await db.insert(kycDocuments).values({ userId, ...data });
  await db.update(users).set({ kycStatus: "pending" }).where(eq(users.id, userId));
}

export async function getUserKycDocuments(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(kycDocuments).where(eq(kycDocuments.userId, userId)).orderBy(desc(kycDocuments.submittedAt));
}

// ─── Investments ────────────────────────────────────────────────────────────────
export async function createInvestment(data: InsertInvestment) {
  const db = await getDb();
  if (!db) return;
  await db.insert(investments).values(data);
}

export async function getUserInvestments(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(investments).where(eq(investments.userId, userId)).orderBy(desc(investments.createdAt));
}

export async function getInvestmentById(id: number, userId: number) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(investments).where(and(eq(investments.id, id), eq(investments.userId, userId)));
  return rows[0] ?? null;
}
