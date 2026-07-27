/**
 * emailOtp.ts — Server-side OTP generation, DB storage, and email delivery
 * Uses Resend for transactional email delivery
 * OTPs are stored in the database (otp_codes table) for persistence across restarts
 */

import { Resend } from "resend";
import { eq, and, lt } from "drizzle-orm";
import { getDb } from "./db";
import { otpCodes } from "../drizzle/schema";

const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes
const MAX_ATTEMPTS = 5;

/** Canonicalize identifiers so requesting and verifying an OTP use the same account key. */
export function normalizeOtpIdentifier(identifier: string): string {
  const trimmed = identifier.trim();
  if (trimmed.includes("@")) return trimmed.toLowerCase();
  return trimmed.replace(/[\s()-]/g, "");
}

/** Generate a cryptographically random 6-digit OTP */
function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/** Store OTP in the database for a given identifier (email or phone) */
export async function storeOtp(identifier: string, method: "email" | "phone"): Promise<string> {
  const db = await getDb();
  const code = generateOtp();
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MS);
  const normalizedIdentifier = normalizeOtpIdentifier(identifier);

  if (db) {
    // Delete any existing OTPs for this identifier
    await db.delete(otpCodes).where(eq(otpCodes.identifier, normalizedIdentifier));
    // Insert new OTP
    await db.insert(otpCodes).values({
      identifier: normalizedIdentifier,
      code,
      method,
      attempts: 0,
      expiresAt,
    });
  }

  return code;
}

/** Verify OTP from the database */
export async function verifyOtp(
  identifier: string,
  inputCode: string
): Promise<{ valid: boolean; reason?: string; method?: "email" | "phone" }> {
  const db = await getDb();
  const normalizedIdentifier = normalizeOtpIdentifier(identifier);

  if (!db) {
    return { valid: false, reason: "Database unavailable. Please try again." };
  }

  // Clean up expired codes first
  await db.delete(otpCodes).where(lt(otpCodes.expiresAt, new Date()));

  const rows = await db
    .select()
    .from(otpCodes)
    .where(eq(otpCodes.identifier, normalizedIdentifier))
    .limit(1);

  const entry = rows[0];

  if (!entry) {
    return { valid: false, reason: "No verification code found. Please request a new one." };
  }

  if (new Date() > entry.expiresAt) {
    await db.delete(otpCodes).where(eq(otpCodes.id, entry.id));
    return { valid: false, reason: "Verification code has expired. Please request a new one." };
  }

  const newAttempts = entry.attempts + 1;

  if (newAttempts > MAX_ATTEMPTS) {
    await db.delete(otpCodes).where(eq(otpCodes.id, entry.id));
    return { valid: false, reason: "Too many attempts. Please request a new verification code." };
  }

  // Update attempt count
  await db.update(otpCodes).set({ attempts: newAttempts }).where(eq(otpCodes.id, entry.id));

  if (entry.code !== inputCode.trim()) {
    const remaining = MAX_ATTEMPTS - newAttempts;
    return {
      valid: false,
      reason: `Invalid code. ${remaining} attempt${remaining === 1 ? "" : "s"} remaining.`,
    };
  }

  // Valid — mark as used and delete
  await db.delete(otpCodes).where(eq(otpCodes.id, entry.id));
  return { valid: true, method: entry.method };
}

/** Send OTP via email using Resend */
export async function sendOtpEmail(
  email: string,
  code: string
): Promise<{ success: boolean; error?: string }> {
  if (!process.env.RESEND_API_KEY) {
    console.warn("[OTP Email] RESEND_API_KEY is not configured");
    return { success: false, error: "Email delivery is not configured." };
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    // Domain goldvaults.us is verified in Resend — use it as the sender
    const fromAddress = process.env.RESEND_FROM_EMAIL || "GoldVaults.us <noreply@goldvaults.us>";

    const { error } = await resend.emails.send({
      from: fromAddress,
      to: [email],
      subject: `Your GoldVaults verification code: ${code}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>GoldVaults Verification Code</title>
          </head>
          <body style="margin:0;padding:0;background-color:#0f172a;font-family:Arial,sans-serif;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f172a;padding:40px 20px;">
              <tr>
                <td align="center">
                  <table width="480" cellpadding="0" cellspacing="0" style="background-color:#1e293b;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.1);">
                    <tr>
                      <td style="height:4px;background:linear-gradient(90deg,#f59e0b,#d97706);"></td>
                    </tr>
                    <tr>
                      <td style="padding:32px 40px 24px;text-align:center;">
                        <img src="https://d2xsxph8kpxj0f.cloudfront.net/310519663787203995/8dFfjruVZM4vxNw44vAGVM/goldvaults-app-icon-BbiHazbzaxmstCQbbGYZ3C.webp"
                             alt="GoldVaults" width="56" height="56" style="border-radius:12px;margin-bottom:16px;" />
                        <h1 style="margin:0;font-size:24px;font-weight:700;color:#f8fafc;">
                          GoldVaults<span style="font-size:16px;opacity:0.6;">.us</span>
                        </h1>
                        <p style="margin:8px 0 0;font-size:14px;color:#94a3b8;">Secure Verification Code</p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:0 40px 32px;">
                        <p style="margin:0 0 24px;font-size:15px;color:#cbd5e1;line-height:1.6;">
                          Use the code below to verify your email address and complete your registration.
                          This code expires in <strong style="color:#f8fafc;">10 minutes</strong>.
                        </p>
                        <div style="background:#0f172a;border:2px solid #f59e0b;border-radius:12px;padding:24px;text-align:center;margin:0 0 24px;">
                          <p style="margin:0 0 8px;font-size:12px;color:#94a3b8;text-transform:uppercase;letter-spacing:2px;">Verification Code</p>
                          <p style="margin:0;font-size:40px;font-weight:800;color:#f59e0b;letter-spacing:12px;font-family:monospace;">${code}</p>
                        </div>
                        <p style="margin:0 0 8px;font-size:13px;color:#64748b;line-height:1.5;">
                          If you didn't request this code, you can safely ignore this email.
                        </p>
                        <p style="margin:0;font-size:13px;color:#64748b;">
                          For security, never share this code with anyone.
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:20px 40px;border-top:1px solid rgba(255,255,255,0.08);text-align:center;">
                        <p style="margin:0;font-size:12px;color:#475569;">
                          © 2026 GoldVaults.us — Gold &amp; Crypto Investment Platform
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error("[OTP Email] Resend error:", error);
      // Generic user-friendly error — don't expose internal Resend details
      return { success: false, error: "Unable to send verification email. Please try again in a moment." };
    }

    return { success: true };
  } catch (err) {
    console.error("[OTP Email] Unexpected error:", err);
    return { success: false, error: "Failed to send email. Please try again." };
  }
}

/** Send OTP via SMS (placeholder — integrate Twilio/AWS SNS for production) */
export async function sendOtpSms(
  phone: string,
  code: string
): Promise<{ success: boolean; error?: string }> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_FROM_NUMBER;
  if (!accountSid || !authToken || !fromNumber) {
    return { success: false, error: "SMS delivery is not configured." };
  }

  try {
    const body = new URLSearchParams({
      To: phone,
      From: fromNumber,
      Body: `Your GoldVaults verification code is ${code}. It expires in 10 minutes.`,
    });
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(accountSid)}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body,
      }
    );
    if (!response.ok) {
      console.error(`[OTP SMS] Twilio rejected the request with status ${response.status}`);
      return { success: false, error: "Unable to send the verification SMS." };
    }
    return { success: true };
  } catch (error) {
    console.error("[OTP SMS] Delivery error:", error instanceof Error ? error.message : "unknown error");
    return { success: false, error: "Unable to send the verification SMS." };
  }
}
