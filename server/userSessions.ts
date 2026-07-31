import crypto from "crypto";
import type { Request } from "express";
import { and, desc, eq, gt, isNull } from "drizzle-orm";
import { users, userSessions } from "../drizzle/schema";
import { getDb } from "./db";
import { getClientIp } from "./loginRateLimit";

export function hashSessionToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function deviceLabel(userAgent: string | undefined): string {
  if (!userAgent) return "Unknown device";
  const browser = /Edg\//.test(userAgent)
    ? "Edge"
    : /Chrome\//.test(userAgent)
      ? "Chrome"
      : /Firefox\//.test(userAgent)
        ? "Firefox"
        : /Safari\//.test(userAgent)
          ? "Safari"
          : "Browser";
  const os = /Windows/.test(userAgent)
    ? "Windows"
    : /Android/.test(userAgent)
      ? "Android"
      : /iPhone|iPad/.test(userAgent)
        ? "iOS"
        : /Mac OS/.test(userAgent)
          ? "macOS"
          : /Linux/.test(userAgent)
            ? "Linux"
            : "Unknown OS";
  return `${browser} on ${os}`;
}

export async function createUserSession(
  userId: number,
  token: string,
  req: Request,
  expiresAt: Date,
) {
  const db = await getDb();
  if (!db) return null;
  const userAgent = req.headers["user-agent"]?.slice(0, 512);
  const ipAddress = getClientIp(req);
  const label = deviceLabel(userAgent);
  const [account] = await db.select({ twoFactorEnabled: users.twoFactorEnabled }).from(users).where(eq(users.id, userId)).limit(1);
  const [recognized] = await db
    .select({ id: userSessions.id })
    .from(userSessions)
    .where(
      and(
        eq(userSessions.userId, userId),
        eq(userSessions.ipAddress, ipAddress),
        eq(userSessions.deviceLabel, label),
      ),
    )
    .limit(1);
  const session = {
    id: crypto.randomUUID(),
    userId,
    tokenHash: hashSessionToken(token),
    ipAddress,
    userAgent: userAgent ?? null,
    deviceLabel: label,
    expiresAt,
    twoFactorVerifiedAt: account?.twoFactorEnabled ? null : new Date(),
  };
  await db.insert(userSessions).values(session);
  return { ...session, recognized: Boolean(recognized) };
}

export async function validateUserSession(userId: number, token: string): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  const [session] = await db
    .select()
    .from(userSessions)
    .where(
      and(
        eq(userSessions.userId, userId),
        eq(userSessions.tokenHash, hashSessionToken(token)),
        isNull(userSessions.revokedAt),
        gt(userSessions.expiresAt, new Date()),
      ),
    )
    .limit(1);
  if (!session) return false;
  const [account] = await db.select({ twoFactorEnabled: users.twoFactorEnabled }).from(users).where(eq(users.id, userId)).limit(1);
  if (account?.twoFactorEnabled && !session.twoFactorVerifiedAt) return false;
  if (Date.now() - session.lastActiveAt.getTime() > 5 * 60_000) {
    await db
      .update(userSessions)
      .set({ lastActiveAt: new Date() })
      .where(eq(userSessions.id, session.id));
  }
  return true;
}

export async function getPendingTwoFactorSession(token: string) {
  const db = await getDb(); if (!db) return null;
  const [session] = await db.select().from(userSessions).where(and(eq(userSessions.tokenHash, hashSessionToken(token)), isNull(userSessions.revokedAt), gt(userSessions.expiresAt, new Date()), isNull(userSessions.twoFactorVerifiedAt))).limit(1);
  if (!session) return null;
  const [account] = await db.select({ enabled: users.twoFactorEnabled }).from(users).where(eq(users.id, session.userId)).limit(1);
  return account?.enabled ? session : null;
}

export async function markSessionTwoFactorVerified(
  token: string,
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  const tokenHash = hashSessionToken(token);
  await db
    .update(userSessions)
    .set({ twoFactorVerifiedAt: new Date() })
    .where(
      and(
        eq(userSessions.tokenHash, tokenHash),
        isNull(userSessions.revokedAt),
        gt(userSessions.expiresAt, new Date()),
      ),
    );
  const [session] = await db
    .select({ twoFactorVerifiedAt: userSessions.twoFactorVerifiedAt })
    .from(userSessions)
    .where(
      and(
        eq(userSessions.tokenHash, tokenHash),
        isNull(userSessions.revokedAt),
        gt(userSessions.expiresAt, new Date()),
      ),
    )
    .limit(1);
  return Boolean(session?.twoFactorVerifiedAt);
}

export async function listUserSessions(userId: number, currentToken?: string) {
  const db = await getDb();
  if (!db) return [];
  const currentHash = currentToken ? hashSessionToken(currentToken) : null;
  const rows = await db
    .select()
    .from(userSessions)
    .where(
      and(
        eq(userSessions.userId, userId),
        isNull(userSessions.revokedAt),
        gt(userSessions.expiresAt, new Date()),
      ),
    )
    .orderBy(desc(userSessions.lastActiveAt));
  return rows.map(({ tokenHash, ...session }) => ({
    ...session,
    ip: session.ipAddress,
    location: "",
    current: tokenHash === currentHash,
  }));
}

export async function revokeUserSession(userId: number, sessionId: string): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db
    .update(userSessions)
    .set({ revokedAt: new Date() })
    .where(and(eq(userSessions.id, sessionId), eq(userSessions.userId, userId)));
}

export async function revokeOtherUserSessions(userId: number, currentToken: string): Promise<void> {
  const db = await getDb();
  if (!db) return;
  const currentHash = hashSessionToken(currentToken);
  const sessions = await db
    .select({ id: userSessions.id, tokenHash: userSessions.tokenHash })
    .from(userSessions)
    .where(and(eq(userSessions.userId, userId), isNull(userSessions.revokedAt)));
  const otherIds = sessions.filter((session) => session.tokenHash !== currentHash).map((session) => session.id);
  for (const id of otherIds) {
    await db.update(userSessions).set({ revokedAt: new Date() }).where(eq(userSessions.id, id));
  }
}

export async function revokeSessionByToken(token: string): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db
    .update(userSessions)
    .set({ revokedAt: new Date() })
    .where(eq(userSessions.tokenHash, hashSessionToken(token)));
}
