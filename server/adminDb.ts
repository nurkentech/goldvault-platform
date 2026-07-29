import { eq, desc, sql, and, like, or, count, sum } from "drizzle-orm";
import { users, wallets, transactions, notifications } from "../drizzle/schema";
import { getDb } from "./db";

export function calculateWithdrawalDebit(amount: string | number, fee: string | number = 0) {
  const debit = Number(amount) + Number(fee);
  if (!Number.isFinite(debit) || Number(amount) <= 0 || Number(fee) < 0) {
    throw new Error("Invalid withdrawal monetary values");
  }
  return debit;
}

// ─── Platform Stats ──────────────────────────────────────────────────────────
export async function getPlatformStats() {
  const db = await getDb();
  if (!db) return { totalUsers: 0, totalDeposits: "0", totalWithdrawals: "0", activeInvestments: 0, revenue: "0", pendingKyc: 0, pendingWithdrawals: 0 };

  const [
    [userCount],
    [depositSum],
    [withdrawalSum],
    [investCount],
    [pendingKyc],
    [pendingWithdrawals],
  ] = await Promise.all([
    db.select({ count: count() }).from(users),
    db.select({ total: sum(transactions.amount) }).from(transactions).where(eq(transactions.type, "deposit")),
    db.select({ total: sum(transactions.amount) }).from(transactions).where(eq(transactions.type, "withdrawal")),
    db.select({ count: count() }).from(transactions).where(sql`${transactions.type} = 'buy' AND ${transactions.status} = 'confirmed'`),
    db.select({ count: count() }).from(users).where(eq(users.kycStatus, "pending")),
    db.select({ count: count() }).from(transactions).where(sql`${transactions.type} = 'withdrawal' AND ${transactions.status} = 'pending'`),
  ]);

  return {
    totalUsers: userCount?.count ?? 0,
    totalDeposits: depositSum?.total ?? "0",
    totalWithdrawals: withdrawalSum?.total ?? "0",
    activeInvestments: investCount?.count ?? 0,
    revenue: String(Number(depositSum?.total ?? 0) * 0.02), // 2% fee estimate
    pendingKyc: pendingKyc?.count ?? 0,
    pendingWithdrawals: pendingWithdrawals?.count ?? 0,
  };
}

// ─── User Management ─────────────────────────────────────────────────────────
export async function getAllUsers(opts: { limit?: number; offset?: number; search?: string; role?: string; kycStatus?: string }) {
  const db = await getDb();
  if (!db) return { users: [], total: 0 };

  const conditions = [];
  if (opts.search) {
    conditions.push(or(
      like(users.name, `%${opts.search}%`),
      like(users.email, `%${opts.search}%`),
      like(users.username, `%${opts.search}%`)
    ));
  }
  if (opts.role && opts.role !== "all") conditions.push(eq(users.role, opts.role as "user" | "admin"));
  if (opts.kycStatus && opts.kycStatus !== "all") conditions.push(eq(users.kycStatus, opts.kycStatus as "unverified" | "pending" | "verified" | "rejected"));

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [[totalResult], userList] = await Promise.all([
    db.select({ count: count() }).from(users).where(whereClause),
    db
      .select({
        id: users.id,
        name: users.name,
        username: users.username,
        email: users.email,
        avatarUrl: users.avatarUrl,
        role: users.role,
        goldCoins: users.goldCoins,
        tier: users.tier,
        totalPoints: users.totalPoints,
        isOnline: users.isOnline,
        kycStatus: users.kycStatus,
        country: users.country,
        createdAt: users.createdAt,
        lastSignedIn: users.lastSignedIn,
      })
      .from(users)
      .where(whereClause)
      .orderBy(desc(users.createdAt))
      .limit(opts.limit ?? 50)
      .offset(opts.offset ?? 0),
  ]);

  return { users: userList, total: totalResult?.count ?? 0 };
}

export async function adminUpdateUser(userId: number, data: {
  role?: "user" | "admin";
  kycStatus?: "unverified" | "pending" | "verified" | "rejected";
  tier?: "bronze" | "silver" | "gold" | "platinum" | "diamond" | "legendary";
  goldCoins?: number;
  isOnline?: boolean;
}) {
  const db = await getDb();
  if (!db) return;
  const clean: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(data)) { if (v !== undefined) clean[k] = v; }
  if (Object.keys(clean).length === 0) return;
  await db.update(users).set(clean).where(eq(users.id, userId));
}

// ─── Transaction Management ──────────────────────────────────────────────────
export async function getAllTransactions(opts: { limit?: number; offset?: number; type?: string; status?: string; search?: string }) {
  const db = await getDb();
  if (!db) return { transactions: [], total: 0 };

  const conditions = [];
  if (opts.type && opts.type !== "all") conditions.push(sql`${transactions.type} = ${opts.type}`);
  if (opts.status && opts.status !== "all") conditions.push(sql`${transactions.status} = ${opts.status}`);
  if (opts.search) {
    conditions.push(or(
      like(transactions.txHash, `%${opts.search}%`),
      like(transactions.toAddress, `%${opts.search}%`)
    ));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [totalResult] = await db.select({ count: count() }).from(transactions).where(whereClause);
  const txList = await db.select().from(transactions).where(whereClause).orderBy(desc(transactions.createdAt)).limit(opts.limit ?? 50).offset(opts.offset ?? 0);

  return { transactions: txList, total: totalResult?.count ?? 0 };
}

export async function adminUpdateTransaction(txId: number, data: { status?: string; note?: string }) {
  const db = await getDb();
  if (!db) return;
  const clean: Record<string, unknown> = {};
  if (data.status) clean.status = data.status;
  if (data.note) clean.note = data.note;
  if (Object.keys(clean).length === 0) return;
  await db.update(transactions).set(clean).where(eq(transactions.id, txId));
}

export async function getTransactionById(txId: number) {
  const db = await getDb();
  if (!db) return null;
  const [transaction] = await db
    .select()
    .from(transactions)
    .where(eq(transactions.id, txId))
    .limit(1);
  return transaction ?? null;
}

export async function approveWithdrawalTransaction(txId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");

  return db.transaction(async (transactionDb) => {
    const [withdrawal] = await transactionDb
      .select()
      .from(transactions)
      .where(eq(transactions.id, txId))
      .limit(1);

    if (!withdrawal || withdrawal.type !== "withdrawal") {
      throw new Error("Withdrawal transaction not found");
    }
    if (withdrawal.status !== "pending") {
      throw new Error("Withdrawal has already been processed");
    }
    const metadata = (withdrawal.metadata ?? {}) as { holdUntil?: string };
    if (metadata.holdUntil && new Date(metadata.holdUntil) > new Date()) {
      throw new Error(`Withdrawal is security-held until ${new Date(metadata.holdUntil).toISOString()}`);
    }

    // Lock the wallet row for the remainder of this transaction so concurrent
    // approvals cannot spend the same balance.
    await transactionDb.execute(
      sql`SELECT ${wallets.id} FROM ${wallets} WHERE ${wallets.userId} = ${withdrawal.userId} AND ${wallets.currency} = ${withdrawal.currency} FOR UPDATE`,
    );
    const [wallet] = await transactionDb
      .select()
      .from(wallets)
      .where(
        and(
          eq(wallets.userId, withdrawal.userId),
          eq(wallets.currency, withdrawal.currency),
        ),
      )
      .limit(1);

    const debit = calculateWithdrawalDebit(withdrawal.amount, withdrawal.fee ?? 0);
    const balance = Number(wallet?.balance ?? 0);
    if (!wallet || !Number.isFinite(debit) || debit <= 0 || balance < debit) {
      throw new Error("Insufficient wallet balance for this withdrawal");
    }

    await transactionDb
      .update(wallets)
      .set({ balance: (balance - debit).toFixed(8) })
      .where(eq(wallets.id, wallet.id));
    await transactionDb
      .update(transactions)
      .set({ status: "confirmed" })
      .where(eq(transactions.id, txId));

    return withdrawal;
  });
}

// ─── Wallet Management ───────────────────────────────────────────────────────
export async function adminCreditWallet(userId: number, currency: string, amount: string) {
  const db = await getDb();
  if (!db) return;
  const existing = await db.select().from(wallets).where(and(eq(wallets.userId, userId), eq(wallets.currency, currency))).limit(1);
  if (existing.length === 0) {
    await db.insert(wallets).values({ userId, currency, balance: amount });
  } else {
    const newBalance = String(Number(existing[0].balance) + Number(amount));
    await db.update(wallets).set({ balance: newBalance }).where(eq(wallets.id, existing[0].id));
  }
}

export async function adminDebitWallet(userId: number, currency: string, amount: string) {
  const db = await getDb();
  if (!db) return;
  const existing = await db.select().from(wallets).where(and(eq(wallets.userId, userId), eq(wallets.currency, currency))).limit(1);
  if (existing.length === 0) return;
  const newBalance = String(Math.max(0, Number(existing[0].balance) - Number(amount)));
  await db.update(wallets).set({ balance: newBalance }).where(eq(wallets.id, existing[0].id));
}

// ─── Announcements (using notifications table with userId = 0 for global) ────
export async function createAnnouncement(data: { title: string; body: string; icon?: string }) {
  const db = await getDb();
  if (!db) return;
  await db.insert(notifications).values({
    userId: 0, // 0 = global announcement
    type: "system",
    title: data.title,
    body: data.body,
    icon: data.icon ?? "megaphone",
  });
}

export async function getAnnouncements(limit = 20) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(notifications).where(eq(notifications.userId, 0)).orderBy(desc(notifications.createdAt)).limit(limit);
}

export async function updateAnnouncement(id: number, data: { title?: string; body?: string; icon?: string }) {
  const db = await getDb();
  if (!db) return;
  const clean: Record<string, unknown> = {};
  if (data.title) clean.title = data.title;
  if (data.body) clean.body = data.body;
  if (data.icon) clean.icon = data.icon;
  if (Object.keys(clean).length === 0) return;
  await db.update(notifications).set(clean).where(and(eq(notifications.id, id), eq(notifications.userId, 0)));
}

export async function deleteAnnouncement(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(notifications).where(and(eq(notifications.id, id), eq(notifications.userId, 0)));
}

// ─── Recent Activity ─────────────────────────────────────────────────────────
export async function getRecentActivity(limit = 20) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(transactions).orderBy(desc(transactions.createdAt)).limit(limit);
}

// ─── User Growth (last 30 days) ──────────────────────────────────────────────
export async function getUserGrowthData() {
  const db = await getDb();
  if (!db) return [];
  const result = await db.select({
    date: sql<string>`DATE(${users.createdAt})`.as("date"),
    count: count(),
  }).from(users).groupBy(sql`DATE(${users.createdAt})`).orderBy(sql`DATE(${users.createdAt})`).limit(30);
  return result;
}

// ─── Pending Withdrawals ─────────────────────────────────────────────────────
export async function getPendingWithdrawals(limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(transactions).where(sql`${transactions.type} = 'withdrawal' AND ${transactions.status} = 'pending'`).orderBy(desc(transactions.createdAt)).limit(limit);
}
