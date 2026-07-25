import type { Request } from "express";
import { TRPCError } from "@trpc/server";

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1_000;
const attempts = new Map<string, { count: number; expiresAt: number }>();

export function getClientIp(req: Request): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") return forwarded.split(",")[0].trim();
  return req.ip || req.socket.remoteAddress || "unknown";
}

export function assertLoginNotRateLimited(req: Request): string {
  const ip = getClientIp(req);
  const entry = attempts.get(ip);
  if (entry && entry.expiresAt <= Date.now()) attempts.delete(ip);
  if (entry && entry.expiresAt > Date.now() && entry.count >= MAX_ATTEMPTS) {
    const retryAfter = Math.ceil((entry.expiresAt - Date.now()) / 1_000);
    throw new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message: `Too many login attempts. Try again in ${retryAfter} seconds.`,
    });
  }
  return ip;
}

export function recordFailedLogin(ip: string): void {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || entry.expiresAt <= now) {
    attempts.set(ip, { count: 1, expiresAt: now + WINDOW_MS });
    return;
  }
  entry.count += 1;
}

export function clearLoginAttempts(ip: string): void {
  attempts.delete(ip);
}
