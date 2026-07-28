import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { Request } from "express";
import { describe, expect, it } from "vitest";
import { getSessionCookieOptions } from "./_core/cookies";
import { getSessionAppId } from "./_core/sdk";

describe("production session persistence", () => {
  it("does not require external OAuth configuration for OTP session tokens", () => {
    expect(getSessionAppId("")).toBe("goldvault-platform");
    expect(getSessionAppId("configured-oauth-app")).toBe("configured-oauth-app");
  });

  it("uses a browser-compatible secure cookie behind the HTTPS proxy", () => {
    const request = {
      protocol: "http",
      headers: { "x-forwarded-proto": "https" },
    } as Request;

    expect(getSessionCookieOptions(request)).toEqual({
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: true,
    });
  });

  it("configures Express to trust the Namecheap proxy", () => {
    const serverEntry = readFileSync(
      resolve(process.cwd(), "server/_core/index.ts"),
      "utf8",
    );
    expect(serverEntry).toContain('app.set("trust proxy", 1)');
  });
});
