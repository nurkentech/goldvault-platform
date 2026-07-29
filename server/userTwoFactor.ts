import crypto from "crypto";
import * as OTPAuth from "otpauth";
import QRCode from "qrcode";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { users } from "../drizzle/schema";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { getDb, getUserById } from "./db";
import { sendOtpSms, storeOtp, verifyOtp } from "./emailOtp";
import { markSessionTwoFactorVerified } from "./userSessions";
import { normalizeUserBackupCodes } from "./recoveryCodes";

const ISSUER = "GoldVaults";
const digest = (value: string) => crypto.createHash("sha256").update(value.trim().toUpperCase()).digest("hex");

function verifyTotp(secret: string, code: string) {
  const totp = new OTPAuth.TOTP({ issuer: ISSUER, label: "account", algorithm: "SHA1", digits: 6, period: 30, secret: OTPAuth.Secret.fromBase32(secret) });
  return totp.validate({ token: code, window: 1 }) !== null;
}

function generateBackupCodes() {
  return Array.from({ length: 10 }, () => crypto.randomBytes(5).toString("hex").toUpperCase().match(/.{1,5}/g)!.join("-"));
}

export async function verifyUserSecondFactor(userId: number, code?: string) {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user?.twoFactorEnabled) return true;
  if (!code) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Two-factor verification code is required" });
  if (user.totpSecret && /^\d{6}$/.test(code) && verifyTotp(user.totpSecret, code)) return true;
  if (user.phone && /^\d{6}$/.test(code)) {
    const sms = await verifyOtp(user.phone, code);
    if (sms.valid) return true;
  }
  const normalizedHash = digest(code);
  const codes = normalizeUserBackupCodes(user.twoFactorBackupCodes);
  const match = codes.find((entry) => !entry.used && crypto.timingSafeEqual(Buffer.from(entry.hash), Buffer.from(normalizedHash)));
  if (match) {
    await db.update(users).set({ twoFactorBackupCodes: codes.map((entry) => entry === match ? { ...entry, used: true } : entry) }).where(eq(users.id, userId));
    return true;
  }
  throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid two-factor verification code" });
}

export const userTwoFactorRouter = router({
  loginStatus: publicProcedure.query(({ ctx }) => ({ required: Boolean(ctx.pendingTwoFactorUserId) })),
  completeLogin: publicProcedure.input(z.object({ code: z.string().min(6).max(32) })).mutation(async ({ ctx, input }) => {
    if (!ctx.pendingTwoFactorUserId || !ctx.pendingTwoFactorToken) throw new TRPCError({ code: "UNAUTHORIZED", message: "No pending two-factor login" });
    await verifyUserSecondFactor(ctx.pendingTwoFactorUserId, input.code);
    await markSessionTwoFactorVerified(ctx.pendingTwoFactorToken);
    return { success: true };
  }),
  sendLoginSms: publicProcedure.mutation(async ({ ctx }) => {
    if (!ctx.pendingTwoFactorUserId) throw new TRPCError({ code: "UNAUTHORIZED" });
    const user = await getUserById(ctx.pendingTwoFactorUserId); if (!user?.phone) throw new TRPCError({ code: "BAD_REQUEST", message: "No verified phone number is available" });
    const code = await storeOtp(user.phone, "phone"); const result = await sendOtpSms(user.phone, code);
    if (!result.success) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: result.error ?? "SMS delivery failed" });
    return { success: true };
  }),
  status: protectedProcedure.query(async ({ ctx }) => {
    const user = await getUserById(ctx.user.id);
    return {
      enabled: user?.twoFactorEnabled ?? false,
      smsAvailable: Boolean(user?.phone),
      backupCodesRemaining: normalizeUserBackupCodes(
        user?.twoFactorBackupCodes,
      ).filter((code) => !code.used).length,
    };
  }),
  setup: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    const user = await getUserById(ctx.user.id); if (!user) throw new TRPCError({ code: "NOT_FOUND" });
    const secret = new OTPAuth.Secret({ size: 20 });
    const totp = new OTPAuth.TOTP({ issuer: ISSUER, label: user.email ?? user.username ?? `user-${user.id}`, algorithm: "SHA1", digits: 6, period: 30, secret });
    await db.update(users).set({ totpSecret: secret.base32, twoFactorEnabled: false }).where(eq(users.id, user.id));
    return { secret: secret.base32, qrCode: await QRCode.toDataURL(totp.toString()), otpauthUri: totp.toString() };
  }),
  enable: protectedProcedure.input(z.object({ code: z.string().length(6) })).mutation(async ({ ctx, input }) => {
    const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    const user = await getUserById(ctx.user.id); if (!user?.totpSecret || !verifyTotp(user.totpSecret, input.code)) throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid authenticator code" });
    const plainCodes = generateBackupCodes();
    await db.update(users).set({ twoFactorEnabled: true, twoFactorBackupCodes: plainCodes.map((code) => ({ hash: digest(code), used: false })) }).where(eq(users.id, user.id));
    return { success: true, backupCodes: plainCodes };
  }),
  disable: protectedProcedure.input(z.object({ code: z.string().min(6).max(32) })).mutation(async ({ ctx, input }) => {
    await verifyUserSecondFactor(ctx.user.id, input.code);
    const db = await getDb(); if (db) await db.update(users).set({ twoFactorEnabled: false, totpSecret: null, twoFactorBackupCodes: null }).where(eq(users.id, ctx.user.id));
    return { success: true };
  }),
  sendSmsFallback: protectedProcedure.mutation(async ({ ctx }) => {
    const user = await getUserById(ctx.user.id); if (!user?.phone) throw new TRPCError({ code: "BAD_REQUEST", message: "Add a phone number first" });
    const code = await storeOtp(user.phone, "phone"); const result = await sendOtpSms(user.phone, code);
    if (!result.success) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: result.error ?? "SMS delivery failed" });
    return { success: true };
  }),
});
