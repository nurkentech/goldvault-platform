import { afterEach, describe, expect, it, vi } from "vitest";
import { COOKIE_NAME, ONE_YEAR_MS } from "../shared/const";
import type { User } from "../drizzle/schema";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { sdk } from "./_core/sdk";
import * as db from "./db";
import * as emailOtp from "./emailOtp";
import * as sessions from "./userSessions";

afterEach(() => {
  vi.restoreAllMocks();
});

function createPublicContext() {
  const cookies: Array<{
    name: string;
    value: string;
    options: Record<string, unknown>;
  }> = [];
  const ctx = {
    user: null,
    adminSession: null,
    pendingTwoFactorUserId: null,
    pendingTwoFactorToken: null,
    req: {
      protocol: "https",
      headers: {
        "user-agent": "Vitest",
      },
    },
    res: {
      cookie: (name: string, value: string, options: Record<string, unknown>) => {
        cookies.push({ name, value, options });
      },
    },
  } as unknown as TrpcContext;
  return { ctx, cookies };
}

const user = {
  id: 42,
  openId: "otp_existing-user",
  name: null,
  email: "person@example.com",
  phone: null,
  loginMethod: "otp_email",
} as User;

describe("OTP authentication", () => {
  it("normalizes identifiers consistently", () => {
    expect(emailOtp.normalizeOtpIdentifier(" Person@Example.COM ")).toBe(
      "person@example.com",
    );
    expect(emailOtp.normalizeOtpIdentifier(" +1 (555) 123-4567 ")).toBe(
      "+15551234567",
    );
  });

  it("creates a user session and secure cookie after OTP verification", async () => {
    vi.spyOn(emailOtp, "verifyOtp").mockResolvedValue({
      valid: true,
      method: "email",
    });
    vi.spyOn(db, "getUserByVerifiedIdentifier").mockResolvedValue(user);
    const upsertUser = vi.spyOn(db, "upsertUser").mockResolvedValue();
    vi.spyOn(db, "getUserByOpenId").mockResolvedValue(user);
    vi.spyOn(sdk, "createSessionToken").mockResolvedValue("signed-session-token");
    const createUserSession = vi
      .spyOn(sessions, "createUserSession")
      .mockResolvedValue({
        id: "session-id",
        recognized: false,
        twoFactorVerifiedAt: new Date(),
      } as never);

    const { ctx, cookies } = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.otp.verify({
      identifier: " Person@Example.COM ",
      code: "123456",
    });

    expect(result.success).toBe(true);
    expect(result.requiresTwoFactor).toBe(false);
    expect(result.user.id).toBe(user.id);
    expect(upsertUser).toHaveBeenCalledWith(
      expect.objectContaining({
        openId: user.openId,
        email: "person@example.com",
        loginMethod: "otp_email",
      }),
    );
    expect(createUserSession).toHaveBeenCalledWith(
      user.id,
      "signed-session-token",
      ctx.req,
      expect.any(Date),
    );
    expect(cookies).toHaveLength(1);
    expect(cookies[0]).toMatchObject({
      name: COOKIE_NAME,
      value: "signed-session-token",
      options: {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
        maxAge: ONE_YEAR_MS,
      },
    });
  });

  it("returns a pending 2FA state instead of treating the session as authenticated", async () => {
    vi.spyOn(emailOtp, "verifyOtp").mockResolvedValue({
      valid: true,
      method: "email",
    });
    vi.spyOn(db, "getUserByVerifiedIdentifier").mockResolvedValue(user);
    vi.spyOn(db, "upsertUser").mockResolvedValue();
    vi.spyOn(db, "getUserByOpenId").mockResolvedValue(user);
    vi.spyOn(sdk, "createSessionToken").mockResolvedValue("pending-session-token");
    vi.spyOn(sessions, "createUserSession").mockResolvedValue({
      id: "pending-session-id",
      recognized: true,
      twoFactorVerifiedAt: null,
    } as never);

    const { ctx } = createPublicContext();
    const result = await appRouter.createCaller(ctx).otp.verify({
      identifier: "person@example.com",
      code: "123456",
    });

    expect(result).toMatchObject({
      success: true,
      requiresTwoFactor: true,
    });
  });
});
