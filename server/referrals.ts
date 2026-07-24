import { and, count, desc, eq, sql } from "drizzle-orm";
import {
  notifications,
  referralCommissions,
  referrals,
  transactions,
  users,
  wallets,
} from "../drizzle/schema";
import { getDb } from "./db";

export async function registerReferralSignup(
  referredUserId: number,
  referralCode: string,
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  const [referrer] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.referralCode, referralCode.toUpperCase()))
    .limit(1);
  if (!referrer || referrer.id === referredUserId) return false;

  await db
    .insert(referrals)
    .values({ referrerId: referrer.id, referredUserId })
    .onDuplicateKeyUpdate({ set: { referredUserId } });
  await db
    .update(users)
    .set({ referredByUserId: referrer.id })
    .where(eq(users.id, referredUserId));
  return true;
}

function commissionRate(referralCount: number): number {
  if (referralCount >= 51) return 0.1;
  if (referralCount >= 11) return 0.075;
  return 0.05;
}

export async function payReferralCommission(input: {
  sourceTransactionId: number;
  referredUserId: number;
  currency: string;
  sourceAmount: string;
}): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  return db.transaction(async (transactionDb) => {
    const [existing] = await transactionDb
      .select({ id: referralCommissions.id })
      .from(referralCommissions)
      .where(eq(referralCommissions.sourceTransactionId, input.sourceTransactionId))
      .limit(1);
    if (existing) return false;

    const [referral] = await transactionDb
      .select()
      .from(referrals)
      .where(eq(referrals.referredUserId, input.referredUserId))
      .limit(1);
    if (!referral) return false;

    const [totals] = await transactionDb
      .select({ value: count() })
      .from(referrals)
      .where(eq(referrals.referrerId, referral.referrerId));
    const amount = Number(input.sourceAmount) * commissionRate(totals?.value ?? 0);
    if (!Number.isFinite(amount) || amount <= 0) return false;

    await transactionDb.execute(
      sql`SELECT ${wallets.id} FROM ${wallets} WHERE ${wallets.userId} = ${referral.referrerId} AND ${wallets.currency} = ${input.currency} FOR UPDATE`,
    );
    const [wallet] = await transactionDb
      .select()
      .from(wallets)
      .where(
        and(
          eq(wallets.userId, referral.referrerId),
          eq(wallets.currency, input.currency),
        ),
      )
      .limit(1);
    if (wallet) {
      await transactionDb
        .update(wallets)
        .set({ balance: (Number(wallet.balance) + amount).toFixed(8) })
        .where(eq(wallets.id, wallet.id));
    } else {
      await transactionDb.insert(wallets).values({
        userId: referral.referrerId,
        currency: input.currency,
        balance: amount.toFixed(8),
      });
    }

    await transactionDb.insert(referralCommissions).values({
      referralId: referral.id,
      sourceTransactionId: input.sourceTransactionId,
      referrerId: referral.referrerId,
      currency: input.currency,
      amount: amount.toFixed(8),
    });
    await transactionDb
      .update(referrals)
      .set({
        status: "paid",
        totalCommission: (Number(referral.totalCommission) + amount).toFixed(8),
      })
      .where(eq(referrals.id, referral.id));
    await transactionDb.insert(transactions).values({
      userId: referral.referrerId,
      type: "receive",
      currency: input.currency,
      amount: amount.toFixed(8),
      status: "confirmed",
      note: "Referral commission",
      metadata: { referralId: referral.id, sourceTransactionId: input.sourceTransactionId },
    });
    await transactionDb.insert(notifications).values({
      userId: referral.referrerId,
      type: "system",
      title: "Referral Commission Earned",
      body: `${amount.toFixed(8)} ${input.currency} was credited to your wallet.`,
      icon: "users",
    });
    return true;
  });
}

export async function getReferralDashboard(userId: number) {
  const db = await getDb();
  if (!db) return { referralCode: "", referrals: [], commissions: [], stats: { total: 0, active: 0, earned: "0" } };
  const [user] = await db.select({ referralCode: users.referralCode }).from(users).where(eq(users.id, userId)).limit(1);
  const referralRows = await db
    .select({
      id: referrals.id,
      status: referrals.status,
      totalCommission: referrals.totalCommission,
      createdAt: referrals.createdAt,
      name: users.name,
    })
    .from(referrals)
    .innerJoin(users, eq(users.id, referrals.referredUserId))
    .where(eq(referrals.referrerId, userId))
    .orderBy(desc(referrals.createdAt));
  const commissions = await db
    .select()
    .from(referralCommissions)
    .where(eq(referralCommissions.referrerId, userId))
    .orderBy(desc(referralCommissions.createdAt))
    .limit(50);
  return {
    referralCode: user?.referralCode ?? "",
    referrals: referralRows,
    commissions,
    stats: {
      total: referralRows.length,
      active: referralRows.filter((row) => row.status !== "signed_up").length,
      earned: commissions.reduce((sum, row) => sum + Number(row.amount), 0).toFixed(8),
    },
  };
}
