import crypto from "crypto";
import { and, eq, isNotNull } from "drizzle-orm";
import { Router } from "express";
import { transactions, trustedWithdrawalIps, wallets } from "../drizzle/schema";
import { authenticateApiKey, monitorTransaction } from "./advancedModules";
import { getDb } from "./db";
import { getClientIp } from "./loginRateLimit";

export const apiKeyRouter = Router();

function getKey(header: string | undefined) {
  if (!header?.startsWith("Bearer gv_")) return null;
  return header.slice("Bearer ".length);
}

apiKeyRouter.get("/api/v1/portfolio", async (req, res) => {
  const rawKey = getKey(req.headers.authorization);
  const key = rawKey ? await authenticateApiKey(rawKey, "read") : null;
  if (!key) return res.status(401).json({ error: "Invalid API key or scope" });
  const db = await getDb();
  const balances = db ? await db.select({ currency: wallets.currency, balance: wallets.balance }).from(wallets).where(eq(wallets.userId, key.userId)) : [];
  return res.json({ data: balances });
});

apiKeyRouter.post("/api/v1/orders", async (req, res) => {
  const rawKey = getKey(req.headers.authorization);
  const key = rawKey ? await authenticateApiKey(rawKey, "trade") : null;
  if (!key) return res.status(401).json({ error: "Invalid API key or scope" });
  const { side, currency, amount } = req.body as Record<string, unknown>;
  if (!(["buy", "sell"].includes(String(side))) || !/^[A-Z0-9]{2,16}$/.test(String(currency)) || !/^\d+(?:\.\d{1,8})?$/.test(String(amount)) || Number(amount) <= 0) return res.status(400).json({ error: "Invalid order" });
  const db = await getDb(); if (!db) return res.status(503).json({ error: "Database unavailable" });
  const reference = `API-${crypto.randomUUID()}`;
  await db.insert(transactions).values({ userId: key.userId, type: side === "buy" ? "buy" : "sell", currency: String(currency), amount: String(amount), status: "pending", txHash: reference, note: "API order" });
  return res.status(202).json({ id: reference, status: "pending" });
});

apiKeyRouter.post("/api/v1/withdrawals", async (req, res) => {
  const rawKey = getKey(req.headers.authorization);
  const key = rawKey ? await authenticateApiKey(rawKey, "withdraw") : null;
  if (!key) return res.status(401).json({ error: "Invalid API key or scope" });
  const { currency, amount, destination } = req.body as Record<string, unknown>;
  if (!/^[A-Z0-9]{2,16}$/.test(String(currency)) || !/^\d+(?:\.\d{1,8})?$/.test(String(amount)) || Number(amount) <= 0 || String(destination).length < 3) return res.status(400).json({ error: "Invalid withdrawal" });
  const db = await getDb(); if (!db) return res.status(503).json({ error: "Database unavailable" });
  const ipAddress = getClientIp(req);
  const [trusted] = await db.select({ id: trustedWithdrawalIps.id }).from(trustedWithdrawalIps).where(and(eq(trustedWithdrawalIps.userId, key.userId), eq(trustedWithdrawalIps.ipAddress, ipAddress), isNotNull(trustedWithdrawalIps.verifiedAt))).limit(1);
  if (!trusted) return res.status(403).json({ error: "API withdrawals require a verified trusted IP" });
  const reference = `APIW-${crypto.randomUUID()}`;
  await db.insert(transactions).values({ userId: key.userId, type: "withdrawal", currency: String(currency), amount: String(amount), status: "pending", txHash: reference, toAddress: String(destination), note: "API withdrawal", metadata: { sourceIp: ipAddress } });
  await monitorTransaction({ userId: key.userId, type: "withdrawal", amount: Number(amount), currency: String(currency) });
  return res.status(202).json({ id: reference, status: "pending" });
});
