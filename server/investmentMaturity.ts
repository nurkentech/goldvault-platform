import { and, eq, lte, sql } from "drizzle-orm";
import {
  investments,
  notifications,
  transactions,
  wallets,
} from "../drizzle/schema";
import { getDb, getUserById } from "./db";
import { sendTransactionalEmail } from "./transactionalEmail";
import { sendPushToUser } from "./pushNotifications";
import { dispatchWebhook } from "./advancedModules";

let heartbeatRunning = false;

export function calculateMaturityPayout(amount: string | number, roiPercent: string | number) {
  const principal = Number(amount);
  const roi = Number(roiPercent);
  const profit = principal * (roi / 100);
  const total = principal + profit;
  if (![principal, roi, profit, total].every(Number.isFinite) || principal <= 0 || roi < 0) {
    throw new Error("Invalid investment monetary values");
  }
  return { principal, profit, total };
}

export async function processMaturedInvestments(): Promise<number> {
  if (heartbeatRunning) return 0;
  heartbeatRunning = true;

  try {
    const db = await getDb();
    if (!db) return 0;
    const matured = await db
      .select({ id: investments.id })
      .from(investments)
      .where(
        and(
          eq(investments.status, "active"),
          lte(investments.endDate, new Date()),
        ),
      );

    let completed = 0;
    for (const candidate of matured) {
      const payout = await db.transaction(async (transactionDb) => {
        await transactionDb.execute(
          sql`SELECT ${investments.id} FROM ${investments} WHERE ${investments.id} = ${candidate.id} FOR UPDATE`,
        );
        const [investment] = await transactionDb
          .select()
          .from(investments)
          .where(eq(investments.id, candidate.id))
          .limit(1);
        if (!investment || investment.status !== "active") return null;

        const { principal, profit, total: totalPayout } = calculateMaturityPayout(
          investment.amount,
          investment.expectedRoi,
        );

        await transactionDb.execute(
          sql`SELECT ${wallets.id} FROM ${wallets} WHERE ${wallets.userId} = ${investment.userId} AND ${wallets.currency} = ${investment.currency} FOR UPDATE`,
        );
        const [wallet] = await transactionDb
          .select()
          .from(wallets)
          .where(
            and(
              eq(wallets.userId, investment.userId),
              eq(wallets.currency, investment.currency),
            ),
          )
          .limit(1);

        if (wallet) {
          await transactionDb
            .update(wallets)
            .set({ balance: (Number(wallet.balance) + totalPayout).toFixed(8) })
            .where(eq(wallets.id, wallet.id));
        } else {
          await transactionDb.insert(wallets).values({
            userId: investment.userId,
            currency: investment.currency,
            balance: totalPayout.toFixed(8),
          });
        }

        await transactionDb
          .update(investments)
          .set({
            status: "completed",
            earnedProfit: profit.toFixed(8),
          })
          .where(eq(investments.id, investment.id));
        await transactionDb.insert(transactions).values({
          userId: investment.userId,
          type: "receive",
          currency: investment.currency,
          amount: totalPayout.toFixed(8),
          status: "confirmed",
          note: `Investment maturity payout: ${investment.planName}`,
          metadata: { investmentId: investment.id, principal, profit },
        });
        await transactionDb.insert(notifications).values({
          userId: investment.userId,
          type: "system",
          title: "Investment Matured",
          body: `${totalPayout.toFixed(8)} ${investment.currency} was credited to your wallet.`,
          icon: "trending-up",
        });

        return {
          userId: investment.userId,
          currency: investment.currency,
          amount: totalPayout.toFixed(8),
        };
      });

      if (payout) {
        completed += 1;
        const user = await getUserById(payout.userId);
        await sendTransactionalEmail({
          to: user?.email,
          kind: "investment_matured",
          payout: payout.amount,
          currency: payout.currency,
        });
        void sendPushToUser(payout.userId, { title: "Investment matured", body: `${payout.amount} ${payout.currency} was credited to your wallet.`, url: "/dashboard/investments", tag: "investment-maturity" });
        void dispatchWebhook("investment.matured", payout);
      }
    }
    return completed;
  } finally {
    heartbeatRunning = false;
  }
}

export function startInvestmentMaturityHeartbeat(): () => void {
  const run = () => {
    void processMaturedInvestments().catch((error) => {
      console.error("[Investment Maturity] Heartbeat failed:", error);
    });
  };
  run();
  const interval = setInterval(run, 60_000);
  interval.unref();
  return () => clearInterval(interval);
}
