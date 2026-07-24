import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  decimal,
  boolean,
  json,
  index,
  uniqueIndex,
} from "drizzle-orm/mysql-core";

// ─── Users ────────────────────────────────────────────────────────────────────────────────
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  username: varchar("username", { length: 64 }).unique(),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 32 }),
  avatarUrl: text("avatarUrl"),
  loginMethod: varchar("loginMethod", { length: 64 }),
  referralCode: varchar("referralCode", { length: 20 }),
  referredByUserId: int("referredByUserId"),
  preferredCurrency: mysqlEnum("preferredCurrency", ["USD", "EUR", "GBP", "NGN"]).default("USD").notNull(),
  preferredLanguage: mysqlEnum("preferredLanguage", ["en", "fr", "es", "ar", "pt"]).default("en").notNull(),
  themePreference: mysqlEnum("themePreference", ["light", "dark", "system"]).default("system").notNull(),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  goldCoins: int("goldCoins").default(500).notNull(),
  tier: mysqlEnum("tier", ["bronze", "silver", "gold", "platinum", "diamond", "legendary"]).default("bronze").notNull(),
  totalPoints: int("totalPoints").default(0).notNull(),
  leaderboardRank: int("leaderboardRank"),
  isOnline: boolean("isOnline").default(false).notNull(),
  kycStatus: mysqlEnum("kycStatus", ["unverified", "pending", "verified", "rejected"]).default("unverified").notNull(),
  twoFactorEnabled: boolean("twoFactorEnabled").default(false).notNull(),
  totpSecret: varchar("totpSecret", { length: 256 }),
  twoFactorBackupCodes: json("twoFactorBackupCodes").$type<{ hash: string; used: boolean }[]>(),
  affiliateStatus: mysqlEnum("affiliateStatus", ["none", "pending", "approved", "suspended"]).default("none").notNull(),
  notifPrefs: json("notifPrefs").$type<{
    priceAlerts: boolean;
    portfolioUpdates: boolean;
    newsDigest: boolean;
    securityAlerts: boolean;
    marketingEmails: boolean;
  }>().default({ priceAlerts: true, portfolioUpdates: true, newsDigest: false, securityAlerts: true, marketingEmails: false }),
  bio: text("bio"),
  country: varchar("country", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
}, (table) => [
  uniqueIndex("users_referral_code_idx").on(table.referralCode),
  index("users_referred_by_idx").on(table.referredByUserId),
  index("users_created_at_idx").on(table.createdAt),
]);

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Wallets ──────────────────────────────────────────────────────────────────────────────
export const wallets = mysqlTable("wallets", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  currency: varchar("currency", { length: 16 }).notNull(),
  balance: decimal("balance", { precision: 20, scale: 8 }).default("0").notNull(),
  address: varchar("address", { length: 128 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => [
  uniqueIndex("wallets_user_currency_idx").on(table.userId, table.currency),
]);

export type Wallet = typeof wallets.$inferSelect;
export type InsertWallet = typeof wallets.$inferInsert;

// ─── Transactions ────────────────────────────────────────────────────────────────────────────
export const transactions = mysqlTable("transactions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  type: mysqlEnum("type", ["send", "receive", "buy", "sell", "mint", "nfc_payment", "goldcoin_transfer", "withdrawal", "deposit"]).notNull(),
  currency: varchar("currency", { length: 16 }).notNull(),
  amount: decimal("amount", { precision: 20, scale: 8 }).notNull(),
  fee: decimal("fee", { precision: 20, scale: 8 }).default("0"),
  status: mysqlEnum("status", ["pending", "confirmed", "failed", "cancelled"]).default("pending").notNull(),
  toAddress: varchar("toAddress", { length: 256 }),
  toUserId: int("toUserId"),
  txHash: varchar("txHash", { length: 128 }),
  network: varchar("network", { length: 32 }),
  note: text("note"),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => [
  index("transactions_user_created_idx").on(table.userId, table.createdAt),
  index("transactions_status_created_idx").on(table.status, table.createdAt),
  index("transactions_type_status_idx").on(table.type, table.status),
]);

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = typeof transactions.$inferInsert;

// ─── Address Book ───────────────────────────────────────────────────────────────────────────
export const addressBook = mysqlTable("address_book", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  label: varchar("label", { length: 128 }).notNull(),
  address: varchar("address", { length: 256 }).notNull(),
  currency: varchar("currency", { length: 16 }).default("BTC").notNull(),
  tag: mysqlEnum("tag", ["exchange", "hardware_wallet", "cold_storage", "friend", "business", "other"]).default("other").notNull(),
  isFavorite: boolean("isFavorite").default(false).notNull(),
  lastUsedAt: timestamp("lastUsedAt"),
  useCount: int("useCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AddressBookEntry = typeof addressBook.$inferSelect;
export type InsertAddressBookEntry = typeof addressBook.$inferInsert;

// ─── Notifications ───────────────────────────────────────────────────────────────────────────
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  type: mysqlEnum("type", ["message", "challenge", "price_alert", "social", "minting", "system", "transaction"]).notNull(),
  title: varchar("title", { length: 256 }).notNull(),
  body: text("body").notNull(),
  icon: varchar("icon", { length: 64 }),
  actionUrl: varchar("actionUrl", { length: 256 }),
  actionLabel: varchar("actionLabel", { length: 64 }),
  isRead: boolean("isRead").default(false).notNull(),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [
  index("notifications_user_created_idx").on(table.userId, table.createdAt),
  index("notifications_user_read_idx").on(table.userId, table.isRead),
]);

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

// ─── Challenges ──────────────────────────────────────────────────────────────────────────────
export const challenges = mysqlTable("challenges", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 256 }).notNull(),
  description: text("description").notNull(),
  type: mysqlEnum("type", ["daily", "weekly", "special"]).notNull(),
  category: mysqlEnum("category", ["trading", "social", "investment", "streak", "referral"]).notNull(),
  reward: int("reward").notNull(),
  target: int("target").notNull(),
  icon: varchar("icon", { length: 64 }),
  isActive: boolean("isActive").default(true).notNull(),
  expiresAt: timestamp("expiresAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Challenge = typeof challenges.$inferSelect;
export type InsertChallenge = typeof challenges.$inferInsert;

// ─── User Challenge Progress ──────────────────────────────────────────────────────────────────
export const userChallenges = mysqlTable("user_challenges", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  challengeId: int("challengeId").notNull(),
  progress: int("progress").default(0).notNull(),
  isCompleted: boolean("isCompleted").default(false).notNull(),
  claimedAt: timestamp("claimedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserChallenge = typeof userChallenges.$inferSelect;
export type InsertUserChallenge = typeof userChallenges.$inferInsert;

// ─── Social Posts ────────────────────────────────────────────────────────────────────────────
export const socialPosts = mysqlTable("social_posts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  content: text("content"),
  mediaUrl: text("mediaUrl"),
  mediaType: mysqlEnum("mediaType", ["image", "video", "none"]).default("none").notNull(),
  platform: varchar("platform", { length: 32 }),
  likes: int("likes").default(0).notNull(),
  shares: int("shares").default(0).notNull(),
  goldCoinsEarned: int("goldCoinsEarned").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SocialPost = typeof socialPosts.$inferSelect;
export type InsertSocialPost = typeof socialPosts.$inferInsert;

// ─── Chat Messages ────────────────────────────────────────────────────────────────────────────
export const chatMessages = mysqlTable("chat_messages", {
  id: int("id").autoincrement().primaryKey(),
  fromUserId: int("fromUserId").notNull(),
  toUserId: int("toUserId").notNull(),
  content: text("content"),
  mediaUrl: text("mediaUrl"),
  mediaType: mysqlEnum("mediaType", ["text", "image", "video", "goldcoin"]).default("text").notNull(),
  isRead: boolean("isRead").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = typeof chatMessages.$inferInsert;

// ─── Gold Minting Records ────────────────────────────────────────────────────────────────────
export const mintingRecords = mysqlTable("minting_records", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  tier: mysqlEnum("tier", ["micro", "standard", "premium", "vault"]).notNull(),
  weightGrams: decimal("weightGrams", { precision: 10, scale: 3 }).notNull(),
  goldCoinsUsed: int("goldCoinsUsed").notNull(),
  txHash: varchar("txHash", { length: 128 }),
  status: mysqlEnum("status", ["pending", "processing", "minted", "delivered"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MintingRecord = typeof mintingRecords.$inferSelect;
export type InsertMintingRecord = typeof mintingRecords.$inferInsert;

// ─── NFC Cards ────────────────────────────────────────────────────────────────────────────────
export const nfcCards = mysqlTable("nfc_cards", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  cardNumber: varchar("cardNumber", { length: 19 }).notNull(),
  cardholderName: varchar("cardholderName", { length: 128 }).notNull(),
  expiryMonth: int("expiryMonth").notNull(),
  expiryYear: int("expiryYear").notNull(),
  cardType: mysqlEnum("cardType", ["virtual", "physical"]).default("virtual").notNull(),
  issuanceStatus: mysqlEnum("issuanceStatus", ["pending", "issued", "rejected"]).default("issued").notNull(),
  pinHash: varchar("pinHash", { length: 256 }),
  isActive: boolean("isActive").default(true).notNull(),
  isFrozen: boolean("isFrozen").default(false).notNull(),
  dailyLimit: decimal("dailyLimit", { precision: 12, scale: 2 }).default("1000.00").notNull(),
  monthlyLimit: decimal("monthlyLimit", { precision: 12, scale: 2 }).default("10000.00").notNull(),
  spentToday: decimal("spentToday", { precision: 12, scale: 2 }).default("0.00").notNull(),
  spentThisMonth: decimal("spentThisMonth", { precision: 12, scale: 2 }).default("0.00").notNull(),
  spendDayKey: varchar("spendDayKey", { length: 10 }),
  spendMonthKey: varchar("spendMonthKey", { length: 7 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type NfcCard = typeof nfcCards.$inferSelect;
export type InsertNfcCard = typeof nfcCards.$inferInsert;

// ─── Price Alerts ───────────────────────────────────────────────────────────────────────────
export const priceAlerts = mysqlTable("price_alerts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  asset: varchar("asset", { length: 16 }).notNull(),
  condition: mysqlEnum("condition", ["above", "below"]).notNull(),
  targetPrice: decimal("targetPrice", { precision: 20, scale: 2 }).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  triggeredAt: timestamp("triggeredAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PriceAlert = typeof priceAlerts.$inferSelect;
export type InsertPriceAlert = typeof priceAlerts.$inferInsert;

// ─── OTP Codes ─────────────────────────────────────────────────────────────────────────────────
export const otpCodes = mysqlTable("otp_codes", {
  id: int("id").autoincrement().primaryKey(),
  identifier: varchar("identifier", { length: 320 }).notNull(), // email or phone
  code: varchar("code", { length: 6 }).notNull(),
  method: mysqlEnum("method", ["email", "phone"]).notNull(),
  attempts: int("attempts").default(0).notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  usedAt: timestamp("usedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type OtpCode = typeof otpCodes.$inferSelect;
export type InsertOtpCode = typeof otpCodes.$inferInsert;

// ─── Admin Credentials ───────────────────────────────────────────────────────────────────
export const adminCredentials = mysqlTable("admin_credentials", {
  id: int("id").autoincrement().primaryKey(),
  username: varchar("username", { length: 64 }).notNull().unique(),
  passwordHash: varchar("passwordHash", { length: 256 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  totpSecret: varchar("totpSecret", { length: 256 }),
  totpEnabled: boolean("totpEnabled").default(false).notNull(),
  recoveryCodes: json("recoveryCodes").$type<{ code: string; used: boolean }[]>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AdminCredential = typeof adminCredentials.$inferSelect;

// ─── KYC Documents ───────────────────────────────────────────────────────────────────────────
export const kycDocuments = mysqlTable("kyc_documents", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  documentType: mysqlEnum("documentType", ["passport", "drivers_license", "national_id"]).notNull(),
  documentFrontUrl: text("documentFrontUrl").notNull(),
  documentBackUrl: text("documentBackUrl"),
  selfieUrl: text("selfieUrl").notNull(),
  proofOfAddressUrl: text("proofOfAddressUrl"),
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
  rejectionReason: text("rejectionReason"),
  submittedAt: timestamp("submittedAt").defaultNow().notNull(),
  reviewedAt: timestamp("reviewedAt"),
}, (table) => [
  index("kyc_user_status_idx").on(table.userId, table.status),
  index("kyc_status_submitted_idx").on(table.status, table.submittedAt),
]);

export type KycDocument = typeof kycDocuments.$inferSelect;
export type InsertKycDocument = typeof kycDocuments.$inferInsert;

// ─── Investments ────────────────────────────────────────────────────────────────────────────
export const investments = mysqlTable("investments", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  planId: varchar("planId", { length: 64 }).notNull(),
  planName: varchar("planName", { length: 128 }).notNull(),
  amount: decimal("amount", { precision: 20, scale: 8 }).notNull(),
  currency: varchar("currency", { length: 16 }).default("USD").notNull(),
  expectedRoi: decimal("expectedRoi", { precision: 5, scale: 2 }).notNull(), // e.g. 12.50 for 12.5%
  duration: int("duration").notNull(), // in days
  status: mysqlEnum("status", ["active", "completed", "cancelled"]).default("active").notNull(),
  earnedProfit: decimal("earnedProfit", { precision: 20, scale: 8 }).default("0").notNull(),
  startDate: timestamp("startDate").defaultNow().notNull(),
  endDate: timestamp("endDate").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => [
  index("investments_user_status_idx").on(table.userId, table.status),
  index("investments_status_end_idx").on(table.status, table.endDate),
  index("investments_created_at_idx").on(table.createdAt),
]);

export type Investment = typeof investments.$inferSelect;
export type InsertInvestment = typeof investments.$inferInsert;

// A single row (id = 1) stores configuration shared by every administrator.
export const platformSettings = mysqlTable("platform_settings", {
  id: int("id").primaryKey(),
  settings: json("settings").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PlatformSettings = typeof platformSettings.$inferSelect;

// ─── Admin audit log ─────────────────────────────────────────────────────────────────────────
export const adminAuditLogs = mysqlTable("admin_audit_logs", {
  id: int("id").autoincrement().primaryKey(),
  adminId: int("adminId"),
  adminUsername: varchar("adminUsername", { length: 64 }),
  action: varchar("action", { length: 160 }).notNull(),
  targetType: varchar("targetType", { length: 64 }),
  targetId: varchar("targetId", { length: 128 }),
  ipAddress: varchar("ipAddress", { length: 64 }).notNull(),
  userAgent: varchar("userAgent", { length: 512 }),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [
  index("audit_admin_created_idx").on(table.adminId, table.createdAt),
  index("audit_action_created_idx").on(table.action, table.createdAt),
]);

export type AdminAuditLog = typeof adminAuditLogs.$inferSelect;

// ─── User sessions ───────────────────────────────────────────────────────────────────────────
export const userSessions = mysqlTable("user_sessions", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: int("userId").notNull(),
  tokenHash: varchar("tokenHash", { length: 64 }).notNull(),
  ipAddress: varchar("ipAddress", { length: 64 }).notNull(),
  userAgent: varchar("userAgent", { length: 512 }),
  deviceLabel: varchar("deviceLabel", { length: 160 }),
  twoFactorVerifiedAt: timestamp("twoFactorVerifiedAt"),
  lastActiveAt: timestamp("lastActiveAt").defaultNow().notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  revokedAt: timestamp("revokedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [
  uniqueIndex("sessions_token_hash_idx").on(table.tokenHash),
  index("sessions_user_active_idx").on(table.userId, table.revokedAt),
  index("sessions_expires_idx").on(table.expiresAt),
]);

export type UserSession = typeof userSessions.$inferSelect;

// ─── Referrals and payouts ───────────────────────────────────────────────────────────────────
export const referrals = mysqlTable("referrals", {
  id: int("id").autoincrement().primaryKey(),
  referrerId: int("referrerId").notNull(),
  referredUserId: int("referredUserId").notNull(),
  status: mysqlEnum("status", ["signed_up", "qualified", "paid"]).default("signed_up").notNull(),
  totalCommission: decimal("totalCommission", { precision: 20, scale: 8 }).default("0").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => [
  uniqueIndex("referrals_referred_user_idx").on(table.referredUserId),
  index("referrals_referrer_created_idx").on(table.referrerId, table.createdAt),
]);

export const referralCommissions = mysqlTable("referral_commissions", {
  id: int("id").autoincrement().primaryKey(),
  referralId: int("referralId").notNull(),
  sourceTransactionId: int("sourceTransactionId").notNull(),
  referrerId: int("referrerId").notNull(),
  currency: varchar("currency", { length: 16 }).notNull(),
  amount: decimal("amount", { precision: 20, scale: 8 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [
  uniqueIndex("referral_commission_source_idx").on(table.sourceTransactionId),
  index("referral_commission_referrer_idx").on(table.referrerId, table.createdAt),
]);

export type Referral = typeof referrals.$inferSelect;
export type ReferralCommission = typeof referralCommissions.$inferSelect;

// Marketplace offers reserve seller funds only when an order is opened.
export const p2pOffers = mysqlTable("p2p_offers", {
  id: int("id").autoincrement().primaryKey(), userId: int("userId").notNull(),
  side: mysqlEnum("side", ["buy", "sell"]).notNull(), asset: varchar("asset", { length: 16 }).notNull(),
  fiatCurrency: varchar("fiatCurrency", { length: 8 }).default("USD").notNull(),
  price: decimal("price", { precision: 20, scale: 8 }).notNull(),
  minAmount: decimal("minAmount", { precision: 20, scale: 8 }).notNull(),
  maxAmount: decimal("maxAmount", { precision: 20, scale: 8 }).notNull(),
  availableAmount: decimal("availableAmount", { precision: 20, scale: 8 }).notNull(),
  paymentMethods: json("paymentMethods").$type<string[]>().notNull(),
  terms: text("terms"), status: mysqlEnum("status", ["active", "paused", "closed"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(), updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => [index("p2p_offer_market_idx").on(table.asset, table.side, table.status), index("p2p_offer_user_idx").on(table.userId, table.createdAt)]);

export const p2pOrders = mysqlTable("p2p_orders", {
  id: int("id").autoincrement().primaryKey(), offerId: int("offerId").notNull(), buyerId: int("buyerId").notNull(), sellerId: int("sellerId").notNull(),
  asset: varchar("asset", { length: 16 }).notNull(), amount: decimal("amount", { precision: 20, scale: 8 }).notNull(),
  fiatCurrency: varchar("fiatCurrency", { length: 8 }).notNull(), fiatAmount: decimal("fiatAmount", { precision: 20, scale: 2 }).notNull(),
  status: mysqlEnum("status", ["escrowed", "paid", "released", "cancelled", "disputed", "refunded"]).default("escrowed").notNull(),
  paymentReference: varchar("paymentReference", { length: 128 }), expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(), updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => [index("p2p_order_buyer_idx").on(table.buyerId, table.createdAt), index("p2p_order_seller_idx").on(table.sellerId, table.createdAt), index("p2p_order_status_idx").on(table.status, table.createdAt)]);

export const p2pMessages = mysqlTable("p2p_messages", {
  id: int("id").autoincrement().primaryKey(), orderId: int("orderId").notNull(), senderId: int("senderId").notNull(),
  body: text("body").notNull(), attachmentUrl: text("attachmentUrl"), createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [index("p2p_message_order_idx").on(table.orderId, table.createdAt)]);

export const p2pDisputes = mysqlTable("p2p_disputes", {
  id: int("id").autoincrement().primaryKey(), orderId: int("orderId").notNull(), openedByUserId: int("openedByUserId").notNull(),
  reason: text("reason").notNull(), evidence: json("evidence").$type<string[]>(),
  status: mysqlEnum("status", ["open", "reviewing", "resolved_buyer", "resolved_seller"]).default("open").notNull(),
  resolution: text("resolution"), resolvedByAdminId: int("resolvedByAdminId"), createdAt: timestamp("createdAt").defaultNow().notNull(), resolvedAt: timestamp("resolvedAt"),
}, (table) => [uniqueIndex("p2p_dispute_order_idx").on(table.orderId), index("p2p_dispute_status_idx").on(table.status, table.createdAt)]);

export const stakingPositions = mysqlTable("staking_positions", {
  id: int("id").autoincrement().primaryKey(), userId: int("userId").notNull(), asset: varchar("asset", { length: 16 }).notNull(),
  amount: decimal("amount", { precision: 20, scale: 8 }).notNull(), apy: decimal("apy", { precision: 6, scale: 2 }).notNull(),
  durationDays: int("durationDays").notNull(), autoCompound: boolean("autoCompound").default(false).notNull(),
  accruedYield: decimal("accruedYield", { precision: 20, scale: 8 }).default("0").notNull(),
  status: mysqlEnum("status", ["active", "completed", "withdrawn_early"]).default("active").notNull(),
  startsAt: timestamp("startsAt").defaultNow().notNull(), unlocksAt: timestamp("unlocksAt").notNull(), endedAt: timestamp("endedAt"),
}, (table) => [index("staking_user_status_idx").on(table.userId, table.status), index("staking_unlock_idx").on(table.status, table.unlocksAt)]);

export const savingsVaults = mysqlTable("savings_vaults", {
  id: int("id").autoincrement().primaryKey(), userId: int("userId").notNull(), name: varchar("name", { length: 128 }).notNull(),
  currency: varchar("currency", { length: 16 }).notNull(), balance: decimal("balance", { precision: 20, scale: 8 }).default("0").notNull(),
  targetAmount: decimal("targetAmount", { precision: 20, scale: 8 }).notNull(), lockUntil: timestamp("lockUntil"),
  status: mysqlEnum("status", ["active", "completed", "closed"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(), updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => [index("vault_user_status_idx").on(table.userId, table.status)]);

export const recurringSchedules = mysqlTable("recurring_schedules", {
  id: int("id").autoincrement().primaryKey(), userId: int("userId").notNull(), kind: mysqlEnum("kind", ["vault_transfer", "deposit"]).notNull(),
  vaultId: int("vaultId"), currency: varchar("currency", { length: 16 }).notNull(), amount: decimal("amount", { precision: 20, scale: 8 }).notNull(),
  frequency: mysqlEnum("frequency", ["daily", "weekly", "monthly"]).notNull(), paymentMethodToken: varchar("paymentMethodToken", { length: 256 }),
  status: mysqlEnum("status", ["active", "paused", "cancelled"]).default("active").notNull(), nextRunAt: timestamp("nextRunAt").notNull(), lastRunAt: timestamp("lastRunAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [index("schedule_due_idx").on(table.status, table.nextRunAt), index("schedule_user_idx").on(table.userId, table.createdAt)]);

export const supportTickets = mysqlTable("support_tickets", {
  id: int("id").autoincrement().primaryKey(), userId: int("userId").notNull(), subject: varchar("subject", { length: 256 }).notNull(),
  category: varchar("category", { length: 64 }).default("general").notNull(), priority: mysqlEnum("priority", ["low", "normal", "high", "urgent"]).default("normal").notNull(),
  status: mysqlEnum("status", ["open", "waiting_user", "waiting_support", "resolved", "closed"]).default("open").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(), updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => [index("ticket_user_idx").on(table.userId, table.createdAt), index("ticket_status_idx").on(table.status, table.updatedAt)]);

export const supportTicketMessages = mysqlTable("support_ticket_messages", {
  id: int("id").autoincrement().primaryKey(), ticketId: int("ticketId").notNull(), senderUserId: int("senderUserId"), senderAdminId: int("senderAdminId"),
  body: text("body").notNull(), attachmentUrl: text("attachmentUrl"), createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [index("ticket_message_idx").on(table.ticketId, table.createdAt)]);

export const pushSubscriptions = mysqlTable("push_subscriptions", {
  id: int("id").autoincrement().primaryKey(), userId: int("userId").notNull(), endpoint: text("endpoint").notNull(),
  endpointHash: varchar("endpointHash", { length: 64 }).notNull(), p256dh: text("p256dh").notNull(), auth: text("auth").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [uniqueIndex("push_endpoint_hash_idx").on(table.endpointHash), index("push_user_idx").on(table.userId)]);

export const trustedWithdrawalIps = mysqlTable("trusted_withdrawal_ips", {
  id: int("id").autoincrement().primaryKey(), userId: int("userId").notNull(), ipAddress: varchar("ipAddress", { length: 64 }).notNull(),
  label: varchar("label", { length: 128 }), verifiedAt: timestamp("verifiedAt"), createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [uniqueIndex("trusted_ip_user_idx").on(table.userId, table.ipAddress)]);

export const amlAlerts = mysqlTable("aml_alerts", {
  id: int("id").autoincrement().primaryKey(), userId: int("userId").notNull(), transactionId: int("transactionId"),
  rule: varchar("rule", { length: 128 }).notNull(), riskScore: int("riskScore").notNull(), details: json("details"),
  status: mysqlEnum("status", ["open", "reviewing", "cleared", "reported"]).default("open").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(), reviewedAt: timestamp("reviewedAt"),
}, (table) => [index("aml_status_idx").on(table.status, table.createdAt), index("aml_user_idx").on(table.userId, table.createdAt)]);

export const suspiciousActivityReports = mysqlTable("suspicious_activity_reports", {
  id: int("id").autoincrement().primaryKey(), alertId: int("alertId").notNull(), filedByAdminId: int("filedByAdminId").notNull(),
  jurisdiction: varchar("jurisdiction", { length: 64 }).notNull(), narrative: text("narrative").notNull(), reference: varchar("reference", { length: 128 }),
  filedAt: timestamp("filedAt").defaultNow().notNull(),
}, (table) => [index("sar_alert_idx").on(table.alertId)]);

export const webhookEndpoints = mysqlTable("webhook_endpoints", {
  id: int("id").autoincrement().primaryKey(), name: varchar("name", { length: 128 }).notNull(), url: text("url").notNull(),
  secret: varchar("secret", { length: 128 }).notNull(), events: json("events").$type<string[]>().notNull(), isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(), updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const webhookDeliveries = mysqlTable("webhook_deliveries", {
  id: int("id").autoincrement().primaryKey(), webhookId: int("webhookId").notNull(), event: varchar("event", { length: 128 }).notNull(),
  responseStatus: int("responseStatus"), attempts: int("attempts").default(0).notNull(), deliveredAt: timestamp("deliveredAt"), error: text("error"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [index("webhook_delivery_idx").on(table.webhookId, table.createdAt)]);

export const apiKeys = mysqlTable("api_keys", {
  id: int("id").autoincrement().primaryKey(), userId: int("userId").notNull(), name: varchar("name", { length: 128 }).notNull(),
  keyPrefix: varchar("keyPrefix", { length: 16 }).notNull(), keyHash: varchar("keyHash", { length: 64 }).notNull(), scopes: json("scopes").$type<string[]>().notNull(),
  lastUsedAt: timestamp("lastUsedAt"), expiresAt: timestamp("expiresAt"), revokedAt: timestamp("revokedAt"), createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [uniqueIndex("api_key_hash_idx").on(table.keyHash), index("api_key_user_idx").on(table.userId, table.createdAt)]);

export const investmentAgreements = mysqlTable("investment_agreements", {
  id: int("id").autoincrement().primaryKey(), userId: int("userId").notNull(), planId: varchar("planId", { length: 64 }).notNull(),
  amount: decimal("amount", { precision: 20, scale: 8 }).notNull(), currency: varchar("currency", { length: 16 }).notNull(),
  termsVersion: varchar("termsVersion", { length: 32 }).notNull(), documentHash: varchar("documentHash", { length: 64 }).notNull(),
  signatureName: varchar("signatureName", { length: 128 }), signedIp: varchar("signedIp", { length: 64 }), signedAt: timestamp("signedAt"),
  expiresAt: timestamp("expiresAt").notNull(), createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [index("agreement_user_plan_idx").on(table.userId, table.planId, table.createdAt)]);

export const affiliateProfiles = mysqlTable("affiliate_profiles", {
  id: int("id").autoincrement().primaryKey(), userId: int("userId").notNull(), parentAffiliateId: int("parentAffiliateId"),
  commissionRate: decimal("commissionRate", { precision: 5, scale: 2 }).default("10").notNull(), totalEarned: decimal("totalEarned", { precision: 20, scale: 8 }).default("0").notNull(),
  payoutBalance: decimal("payoutBalance", { precision: 20, scale: 8 }).default("0").notNull(), status: mysqlEnum("status", ["pending", "approved", "suspended"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [uniqueIndex("affiliate_user_idx").on(table.userId), index("affiliate_parent_idx").on(table.parentAffiliateId)]);

export const affiliatePayouts = mysqlTable("affiliate_payouts", {
  id: int("id").autoincrement().primaryKey(), affiliateId: int("affiliateId").notNull(), amount: decimal("amount", { precision: 20, scale: 8 }).notNull(),
  currency: varchar("currency", { length: 16 }).default("USD").notNull(), status: mysqlEnum("status", ["requested", "approved", "paid", "rejected"]).default("requested").notNull(),
  requestedAt: timestamp("requestedAt").defaultNow().notNull(), processedAt: timestamp("processedAt"),
}, (table) => [index("affiliate_payout_idx").on(table.affiliateId, table.requestedAt)]);

export const blogCategories = mysqlTable("blog_categories", {
  id: int("id").autoincrement().primaryKey(), name: varchar("name", { length: 128 }).notNull(), slug: varchar("slug", { length: 128 }).notNull(),
}, (table) => [uniqueIndex("blog_category_slug_idx").on(table.slug)]);

export const blogPosts = mysqlTable("blog_posts", {
  id: int("id").autoincrement().primaryKey(), authorAdminId: int("authorAdminId").notNull(), categoryId: int("categoryId"),
  title: varchar("title", { length: 256 }).notNull(), slug: varchar("slug", { length: 256 }).notNull(), excerpt: text("excerpt").notNull(), content: text("content").notNull(),
  coverImageUrl: text("coverImageUrl"), seoTitle: varchar("seoTitle", { length: 256 }), seoDescription: varchar("seoDescription", { length: 320 }),
  status: mysqlEnum("status", ["draft", "published", "archived"]).default("draft").notNull(), publishedAt: timestamp("publishedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(), updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => [uniqueIndex("blog_slug_idx").on(table.slug), index("blog_status_published_idx").on(table.status, table.publishedAt)]);

// ─── Read-only AI Copilot ────────────────────────────────────────────────
export type AiCopilotResponseData = {
  answer: string;
  summary: string;
  insights: Array<{ title: string; detail: string; severity: "info" | "positive" | "warning" }>;
  actions: Array<{ label: string; href: string }>;
  sources: Array<{ label: string; reference: string }>;
  disclaimer: string;
};

export const aiConversations = mysqlTable("ai_conversations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 160 }).default("New conversation").notNull(),
  language: mysqlEnum("language", ["en", "fr", "es", "ar", "pt"]).default("en").notNull(),
  status: mysqlEnum("status", ["active", "archived"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => [
  index("ai_conversation_user_status_idx").on(table.userId, table.status, table.updatedAt),
]);

export const aiMessages = mysqlTable("ai_messages", {
  id: int("id").autoincrement().primaryKey(),
  conversationId: int("conversationId").notNull(),
  role: mysqlEnum("role", ["user", "assistant"]).notNull(),
  content: text("content").notNull(),
  responseData: json("responseData").$type<AiCopilotResponseData>(),
  model: varchar("model", { length: 128 }),
  inputTokens: int("inputTokens"),
  outputTokens: int("outputTokens"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [
  index("ai_message_conversation_idx").on(table.conversationId, table.createdAt),
]);

export const aiMessageFeedback = mysqlTable("ai_message_feedback", {
  id: int("id").autoincrement().primaryKey(),
  messageId: int("messageId").notNull(),
  userId: int("userId").notNull(),
  rating: mysqlEnum("rating", ["helpful", "unhelpful"]).notNull(),
  comment: varchar("comment", { length: 1000 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [
  uniqueIndex("ai_feedback_message_user_idx").on(table.messageId, table.userId),
]);

export const aiUsageLogs = mysqlTable("ai_usage_logs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  adminId: int("adminId"),
  mode: mysqlEnum("mode", ["portfolio", "support", "compliance"]).notNull(),
  model: varchar("model", { length: 128 }).notNull(),
  providerRequestId: varchar("providerRequestId", { length: 128 }),
  inputTokens: int("inputTokens").default(0).notNull(),
  outputTokens: int("outputTokens").default(0).notNull(),
  latencyMs: int("latencyMs").notNull(),
  status: mysqlEnum("status", ["success", "refused", "error"]).notNull(),
  safetyFlags: json("safetyFlags").$type<string[]>().default([]).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [
  index("ai_usage_user_created_idx").on(table.userId, table.createdAt),
  index("ai_usage_mode_created_idx").on(table.mode, table.createdAt),
]);
