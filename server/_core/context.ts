import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { sdk } from "./sdk";
import { verifyAdminToken, ADMIN_COOKIE_NAME } from "../adminAuth";
import { COOKIE_NAME } from "@shared/const";
import { getPendingTwoFactorSession } from "../userSessions";

export type AdminSession = {
  adminId: number;
  username: string;
};

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
  adminSession: AdminSession | null;
  pendingTwoFactorUserId: number | null;
  pendingTwoFactorToken: string | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;
  let adminSession: AdminSession | null = null;
  let pendingTwoFactorUserId: number | null = null;
  let pendingTwoFactorToken: string | null = null;

  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    // Authentication is optional for public procedures.
    user = null;
    const cookieToken = (opts.req as typeof opts.req & { cookies?: Record<string, string> }).cookies?.[COOKIE_NAME];
    const bearerToken = opts.req.headers.authorization?.startsWith("Bearer ") ? opts.req.headers.authorization.slice(7) : null;
    const sessionToken = cookieToken ?? bearerToken;
    if (sessionToken) {
      const pending = await getPendingTwoFactorSession(sessionToken);
      if (pending) { pendingTwoFactorUserId = pending.userId; pendingTwoFactorToken = sessionToken; }
    }
  }

  // Check for admin session cookie
  try {
    const adminToken = (opts.req as any).cookies?.[ADMIN_COOKIE_NAME];
    if (adminToken) {
      const payload = await verifyAdminToken(adminToken);
      if (payload?.isAdmin && !payload.pre2fa) {
        adminSession = { adminId: payload.adminId, username: payload.username };
      }
    }
  } catch {
    adminSession = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
    adminSession,
    pendingTwoFactorUserId,
    pendingTwoFactorToken,
  };
}
