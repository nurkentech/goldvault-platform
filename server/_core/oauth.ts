import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";
import {
  assertLoginNotRateLimited,
  clearLoginAttempts,
  recordFailedLogin,
} from "../loginRateLimit";
import { createUserSession } from "../userSessions";
import { sendTransactionalEmail } from "../transactionalEmail";
import { registerReferralSignup } from "../referrals";

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

export function registerOAuthRoutes(app: Express) {
  app.get("/api/oauth/callback", async (req: Request, res: Response) => {
    let clientIp: string;
    try {
      clientIp = assertLoginNotRateLimited(req);
    } catch {
      res.status(429).json({ error: "Too many login attempts. Please try again later." });
      return;
    }
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");

    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }

    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);

      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }

      await db.upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: new Date(),
      });

      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS,
      });

      const signedInUser = await db.getUserByOpenId(userInfo.openId);
      if (!signedInUser) throw new Error("Unable to load signed-in user");
      try {
        const decoded = Buffer.from(state, "base64").toString("utf8");
        const parsed = JSON.parse(decoded) as { returnPath?: string };
        const referralCode = parsed.returnPath?.match(/^\/ref\/([A-Z0-9-]+)$/i)?.[1];
        if (referralCode) await registerReferralSignup(signedInUser.id, referralCode);
      } catch {
        // State formats without a referral return path require no referral action.
      }
      const session = await createUserSession(
        signedInUser.id,
        sessionToken,
        req,
        new Date(Date.now() + ONE_YEAR_MS),
      );
      if (session && !session.recognized) {
        await sendTransactionalEmail({
          to: signedInUser.email,
          kind: "new_login",
          device: session.deviceLabel ?? undefined,
          ipAddress: session.ipAddress,
        });
      }

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      clearLoginAttempts(clientIp);

      // Parse return path from state (base64-encoded JSON with origin + returnPath)
      let redirectTo = session?.twoFactorVerifiedAt ? "/dashboard" : "/verify-2fa";
      try {
        const decoded = Buffer.from(state, "base64").toString("utf8");
        const parsed = JSON.parse(decoded);
        if (session?.twoFactorVerifiedAt && parsed.returnPath && typeof parsed.returnPath === "string" && parsed.returnPath.startsWith("/")) {
          redirectTo = parsed.returnPath;
        }
      } catch {
        // state is not JSON — use default redirect
      }
      res.redirect(302, redirectTo);
    } catch (error) {
      recordFailedLogin(clientIp);
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}
