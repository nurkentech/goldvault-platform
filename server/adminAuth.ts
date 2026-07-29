import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, publicProcedure } from "./_core/trpc";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { getDb } from "./db";
import { adminCredentials } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import * as OTPAuth from "otpauth";
import QRCode from "qrcode";
import crypto from "crypto";
import {
  assertLoginNotRateLimited,
  clearLoginAttempts,
  recordFailedLogin,
} from "./loginRateLimit";
import { normalizeAdminRecoveryCodes } from "./recoveryCodes";

const ADMIN_JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "admin-secret-key");
const ADMIN_COOKIE_NAME = "admin_session";
const TOTP_ISSUER = "GoldVaults Admin";
const RECOVERY_CODE_COUNT = 8;

// Hash password helper
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

// Verify password helper
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Generate admin JWT
async function generateAdminToken(adminId: number, username: string): Promise<string> {
  return new SignJWT({ adminId, username, isAdmin: true })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("24h")
    .sign(ADMIN_JWT_SECRET);
}

// Generate a temporary pre-2FA token (short-lived, only valid for TOTP step)
async function generatePre2FAToken(adminId: number, username: string): Promise<string> {
  return new SignJWT({ adminId, username, pre2fa: true })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("5m")
    .sign(ADMIN_JWT_SECRET);
}

// Verify admin JWT
export async function verifyAdminToken(token: string): Promise<{ adminId: number; username: string; isAdmin: boolean; pre2fa?: boolean } | null> {
  try {
    const { payload } = await jwtVerify(token, ADMIN_JWT_SECRET);
    return payload as any;
  } catch {
    return null;
  }
}

// Helper to get admin session from request
function getAdminSession(ctx: any) {
  const req = ctx.req;
  const token = req?.cookies?.[ADMIN_COOKIE_NAME];
  return token;
}

// Verify TOTP code
function verifyTOTP(secret: string, code: string): boolean {
  const totp = new OTPAuth.TOTP({
    issuer: TOTP_ISSUER,
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret: OTPAuth.Secret.fromBase32(secret),
  });
  const delta = totp.validate({ token: code, window: 1 });
  return delta !== null;
}

// Generate recovery codes (8 codes, format: XXXX-XXXX)
function generateRecoveryCodes(): string[] {
  const codes: string[] = [];
  for (let i = 0; i < RECOVERY_CODE_COUNT; i++) {
    const part1 = crypto.randomBytes(2).toString("hex").toUpperCase();
    const part2 = crypto.randomBytes(2).toString("hex").toUpperCase();
    codes.push(`${part1}-${part2}`);
  }
  return codes;
}

// Hash a recovery code for storage
function hashRecoveryCode(code: string): string {
  return crypto.createHash("sha256").update(code.toUpperCase().replace(/-/g, "")).digest("hex");
}

export const adminAuthRouter = router({
  login: publicProcedure
    .input(z.object({
      username: z.string().min(1),
      password: z.string().min(1),
    }))
    .mutation(async ({ input, ctx }) => {
      const clientIp = assertLoginNotRateLimited(ctx.req);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const [admin] = await db
        .select()
        .from(adminCredentials)
        .where(eq(adminCredentials.username, input.username))
        .limit(1);

      if (!admin) {
        recordFailedLogin(clientIp);
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid username or password" });
      }

      const valid = await verifyPassword(input.password, admin.passwordHash);
      if (!valid) {
        recordFailedLogin(clientIp);
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid username or password" });
      }

      clearLoginAttempts(clientIp);

      // If 2FA is enabled, return a pre-2FA token and require TOTP verification
      if (admin.totpEnabled && admin.totpSecret) {
        const pre2faToken = await generatePre2FAToken(admin.id, admin.username);
        return { success: true, requires2FA: true, pre2faToken, username: admin.username, email: admin.email };
      }

      // No 2FA - issue full session
      const token = await generateAdminToken(admin.id, admin.username);
      (ctx as any).res?.cookie(ADMIN_COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax" as const,
        maxAge: 24 * 60 * 60 * 1000,
        path: "/",
      });

      return { success: true, requires2FA: false, username: admin.username, email: admin.email };
    }),

  // Verify TOTP code during login (second step)
  verify2FALogin: publicProcedure
    .input(z.object({
      pre2faToken: z.string().min(1),
      code: z.string().length(6),
    }))
    .mutation(async ({ input, ctx }) => {
      const payload = await verifyAdminToken(input.pre2faToken);
      if (!payload || !payload.pre2fa) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid or expired verification token" });
      }

      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const [admin] = await db
        .select()
        .from(adminCredentials)
        .where(eq(adminCredentials.id, payload.adminId))
        .limit(1);

      if (!admin || !admin.totpSecret) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "2FA not configured" });
      }

      const isValid = verifyTOTP(admin.totpSecret, input.code);
      if (!isValid) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid 2FA code" });
      }

      // Issue full session token
      const token = await generateAdminToken(admin.id, admin.username);
      (ctx as any).res?.cookie(ADMIN_COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax" as const,
        maxAge: 24 * 60 * 60 * 1000,
        path: "/",
      });

      return { success: true, username: admin.username, email: admin.email };
    }),

  // Verify recovery code during login (alternative to TOTP)
  verifyRecoveryCode: publicProcedure
    .input(z.object({
      pre2faToken: z.string().min(1),
      recoveryCode: z.string().min(1),
    }))
    .mutation(async ({ input, ctx }) => {
      const payload = await verifyAdminToken(input.pre2faToken);
      if (!payload || !payload.pre2fa) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid or expired verification token" });
      }

      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const [admin] = await db
        .select()
        .from(adminCredentials)
        .where(eq(adminCredentials.id, payload.adminId))
        .limit(1);

      if (!admin) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Admin not found" });
      }

      const codes = normalizeAdminRecoveryCodes(admin.recoveryCodes);
      if (codes.length === 0) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "No recovery codes configured" });
      }

      const inputHash = hashRecoveryCode(input.recoveryCode);
      const matchIndex = codes.findIndex((c) => c.code === inputHash && !c.used);

      if (matchIndex === -1) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid or already used recovery code" });
      }

      // Mark the code as used
      const updatedCodes = [...codes];
      updatedCodes[matchIndex] = { ...updatedCodes[matchIndex], used: true };
      await db.update(adminCredentials)
        .set({ recoveryCodes: updatedCodes })
        .where(eq(adminCredentials.id, payload.adminId));

      // Issue full session token
      const token = await generateAdminToken(admin.id, admin.username);
      (ctx as any).res?.cookie(ADMIN_COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax" as const,
        maxAge: 24 * 60 * 60 * 1000,
        path: "/",
      });

      // Count remaining codes
      const remaining = updatedCodes.filter((c) => !c.used).length;

      return { success: true, username: admin.username, email: admin.email, remainingCodes: remaining };
    }),

  logout: publicProcedure.mutation(async ({ ctx }) => {
    (ctx as any).res?.clearCookie(ADMIN_COOKIE_NAME, { path: "/" });
    return { success: true };
  }),

  me: publicProcedure.query(async ({ ctx }) => {
    const token = getAdminSession(ctx);
    if (!token) return null;

    const payload = await verifyAdminToken(token);
    if (!payload || payload.pre2fa) return null;

    const db = await getDb();
    if (!db) return null;
    const [admin] = await db
      .select({
        id: adminCredentials.id,
        username: adminCredentials.username,
        email: adminCredentials.email,
        totpEnabled: adminCredentials.totpEnabled,
        recoveryCodes: adminCredentials.recoveryCodes,
      })
      .from(adminCredentials)
      .where(eq(adminCredentials.id, payload.adminId))
      .limit(1);

    if (!admin) return null;

    // Return recovery code count (not the actual codes)
    const codes = normalizeAdminRecoveryCodes(admin.recoveryCodes);
    const recoveryCodesRemaining = codes.filter((c) => !c.used).length;

    return {
      id: admin.id,
      username: admin.username,
      email: admin.email,
      totpEnabled: admin.totpEnabled,
      recoveryCodesRemaining,
    };
  }),

  // Generate TOTP secret and QR code for setup
  setup2FA: publicProcedure.mutation(async ({ ctx }) => {
    const token = getAdminSession(ctx);
    if (!token) throw new TRPCError({ code: "UNAUTHORIZED", message: "Not authenticated" });

    const payload = await verifyAdminToken(token);
    if (!payload || payload.pre2fa) throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid session" });

    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

    const [admin] = await db
      .select()
      .from(adminCredentials)
      .where(eq(adminCredentials.id, payload.adminId))
      .limit(1);

    if (!admin) throw new TRPCError({ code: "NOT_FOUND", message: "Admin not found" });

    // Generate a new secret
    const secret = new OTPAuth.Secret({ size: 20 });
    const totp = new OTPAuth.TOTP({
      issuer: TOTP_ISSUER,
      label: admin.username,
      algorithm: "SHA1",
      digits: 6,
      period: 30,
      secret,
    });

    const otpauthUri = totp.toString();
    const qrCodeDataUrl = await QRCode.toDataURL(otpauthUri);

    // Store the secret temporarily (not yet enabled)
    await db.update(adminCredentials)
      .set({ totpSecret: secret.base32 })
      .where(eq(adminCredentials.id, payload.adminId));

    return {
      secret: secret.base32,
      qrCode: qrCodeDataUrl,
      otpauthUri,
    };
  }),

  // Verify TOTP code and enable 2FA + generate recovery codes
  enable2FA: publicProcedure
    .input(z.object({
      code: z.string().length(6),
    }))
    .mutation(async ({ input, ctx }) => {
      const token = getAdminSession(ctx);
      if (!token) throw new TRPCError({ code: "UNAUTHORIZED", message: "Not authenticated" });

      const payload = await verifyAdminToken(token);
      if (!payload || payload.pre2fa) throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid session" });

      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const [admin] = await db
        .select()
        .from(adminCredentials)
        .where(eq(adminCredentials.id, payload.adminId))
        .limit(1);

      if (!admin || !admin.totpSecret) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "2FA setup not initiated. Please generate a QR code first." });
      }

      const isValid = verifyTOTP(admin.totpSecret, input.code);
      if (!isValid) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid verification code. Please try again." });
      }

      // Generate recovery codes
      const plainCodes = generateRecoveryCodes();
      const hashedCodes = plainCodes.map((code) => ({
        code: hashRecoveryCode(code),
        used: false,
      }));

      // Enable 2FA and store hashed recovery codes
      await db.update(adminCredentials)
        .set({ totpEnabled: true, recoveryCodes: hashedCodes })
        .where(eq(adminCredentials.id, payload.adminId));

      // Return plain codes to user (only shown once)
      return { success: true, recoveryCodes: plainCodes };
    }),

  // Regenerate recovery codes (requires password)
  regenerateRecoveryCodes: publicProcedure
    .input(z.object({
      password: z.string().min(1),
    }))
    .mutation(async ({ input, ctx }) => {
      const token = getAdminSession(ctx);
      if (!token) throw new TRPCError({ code: "UNAUTHORIZED", message: "Not authenticated" });

      const payload = await verifyAdminToken(token);
      if (!payload || payload.pre2fa) throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid session" });

      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const [admin] = await db
        .select()
        .from(adminCredentials)
        .where(eq(adminCredentials.id, payload.adminId))
        .limit(1);

      if (!admin) throw new TRPCError({ code: "NOT_FOUND", message: "Admin not found" });
      if (!admin.totpEnabled) throw new TRPCError({ code: "BAD_REQUEST", message: "2FA is not enabled" });

      const valid = await verifyPassword(input.password, admin.passwordHash);
      if (!valid) throw new TRPCError({ code: "UNAUTHORIZED", message: "Incorrect password" });

      // Generate new recovery codes
      const plainCodes = generateRecoveryCodes();
      const hashedCodes = plainCodes.map((code) => ({
        code: hashRecoveryCode(code),
        used: false,
      }));

      await db.update(adminCredentials)
        .set({ recoveryCodes: hashedCodes })
        .where(eq(adminCredentials.id, payload.adminId));

      return { success: true, recoveryCodes: plainCodes };
    }),

  // Disable 2FA (requires current password)
  disable2FA: publicProcedure
    .input(z.object({
      password: z.string().min(1),
    }))
    .mutation(async ({ input, ctx }) => {
      const token = getAdminSession(ctx);
      if (!token) throw new TRPCError({ code: "UNAUTHORIZED", message: "Not authenticated" });

      const payload = await verifyAdminToken(token);
      if (!payload || payload.pre2fa) throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid session" });

      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const [admin] = await db
        .select()
        .from(adminCredentials)
        .where(eq(adminCredentials.id, payload.adminId))
        .limit(1);

      if (!admin) throw new TRPCError({ code: "NOT_FOUND", message: "Admin not found" });

      const valid = await verifyPassword(input.password, admin.passwordHash);
      if (!valid) throw new TRPCError({ code: "UNAUTHORIZED", message: "Incorrect password" });

      // Disable 2FA and clear secret + recovery codes
      await db.update(adminCredentials)
        .set({ totpEnabled: false, totpSecret: null, recoveryCodes: null })
        .where(eq(adminCredentials.id, payload.adminId));

      return { success: true };
    }),

  changeCredentials: publicProcedure
    .input(z.object({
      currentPassword: z.string().min(1),
      newUsername: z.string().min(3).max(64).optional(),
      newEmail: z.string().email().optional(),
      newPassword: z.string().min(6).max(128).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const token = getAdminSession(ctx);
      if (!token) throw new TRPCError({ code: "UNAUTHORIZED", message: "Not authenticated" });

      const payload = await verifyAdminToken(token);
      if (!payload || payload.pre2fa) throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid session" });

      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const [admin] = await db
        .select()
        .from(adminCredentials)
        .where(eq(adminCredentials.id, payload.adminId))
        .limit(1);

      if (!admin) throw new TRPCError({ code: "NOT_FOUND", message: "Admin not found" });

      const valid = await verifyPassword(input.currentPassword, admin.passwordHash);
      if (!valid) throw new TRPCError({ code: "UNAUTHORIZED", message: "Current password is incorrect" });

      const updates: Partial<{ username: string; email: string; passwordHash: string }> = {};
      if (input.newUsername) updates.username = input.newUsername;
      if (input.newEmail) updates.email = input.newEmail;
      if (input.newPassword) updates.passwordHash = await hashPassword(input.newPassword);

      if (Object.keys(updates).length === 0) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "No changes provided" });
      }

      await db.update(adminCredentials).set(updates).where(eq(adminCredentials.id, payload.adminId));

      if (input.newUsername) {
        const newToken = await generateAdminToken(admin.id, input.newUsername);
        (ctx as any).res?.cookie(ADMIN_COOKIE_NAME, newToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax" as const,
          maxAge: 24 * 60 * 60 * 1000,
          path: "/",
        });
      }

      return { success: true };
    }),
});

export { ADMIN_COOKIE_NAME };
