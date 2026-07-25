import type { Request } from "express";
import { desc } from "drizzle-orm";
import { adminAuditLogs } from "../drizzle/schema";
import { getDb } from "./db";
import { getClientIp } from "./loginRateLimit";

const SECRET_KEYS = /password|token|secret|code|recovery/i;

function redact(value: unknown): unknown {
  if (!value || typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map(redact);
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, entry]) => [
      key,
      SECRET_KEYS.test(key) ? "[REDACTED]" : redact(entry),
    ]),
  );
}

export async function recordAdminAudit(input: {
  adminId?: number | null;
  adminUsername?: string | null;
  action: string;
  rawInput: unknown;
  req: Request;
}): Promise<void> {
  const db = await getDb();
  if (!db) return;
  const raw = (input.rawInput ?? {}) as Record<string, unknown>;
  const targetId = raw.userId ?? raw.txId ?? raw.id ?? null;
  const targetType = raw.userId
    ? "user"
    : raw.txId
      ? "transaction"
      : raw.id
        ? "record"
        : null;
  await db.insert(adminAuditLogs).values({
    adminId: input.adminId ?? null,
    adminUsername: input.adminUsername ?? null,
    action: input.action.slice(0, 160),
    targetType,
    targetId: targetId === null ? null : String(targetId).slice(0, 128),
    ipAddress: getClientIp(input.req),
    userAgent: input.req.headers["user-agent"]?.slice(0, 512) ?? null,
    metadata: redact(raw),
  });
}

export async function listAdminAuditLogs(limit = 100) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(adminAuditLogs)
    .orderBy(desc(adminAuditLogs.createdAt))
    .limit(limit);
}
