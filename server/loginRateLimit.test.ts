import { describe, expect, it } from "vitest";
import type { Request } from "express";
import {
  assertLoginNotRateLimited,
  clearLoginAttempts,
  recordFailedLogin,
} from "./loginRateLimit";

function requestFrom(ip: string): Request {
  return {
    headers: { "x-forwarded-for": ip },
    socket: {},
  } as Request;
}

describe("login rate limiting", () => {
  it("blocks the sixth attempt within fifteen minutes", () => {
    const request = requestFrom("203.0.113.10");
    const ip = assertLoginNotRateLimited(request);

    for (let attempt = 0; attempt < 5; attempt += 1) {
      recordFailedLogin(ip);
    }

    expect(() => assertLoginNotRateLimited(request)).toThrow(
      "Too many login attempts",
    );
    clearLoginAttempts(ip);
    expect(assertLoginNotRateLimited(request)).toBe(ip);
  });
});
