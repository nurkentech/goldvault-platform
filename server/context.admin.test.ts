import { SignJWT } from "jose";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ADMIN_COOKIE_NAME } from "./adminAuth";
import { createContext } from "./_core/context";
import { sdk } from "./_core/sdk";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("custom admin request context", () => {
  it("verifies the admin cookie without running regular user authentication", async () => {
    const token = await new SignJWT({
      adminId: 7,
      username: "admin",
      isAdmin: true,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("5m")
      .sign(new TextEncoder().encode(process.env.JWT_SECRET || "admin-secret-key"));
    const authenticateRequest = vi.spyOn(sdk, "authenticateRequest");

    const context = await createContext({
      req: {
        cookies: { [ADMIN_COOKIE_NAME]: token },
        headers: {},
      },
      res: {},
    } as never);

    expect(context.adminSession).toEqual({ adminId: 7, username: "admin" });
    expect(context.user).toBeNull();
    expect(authenticateRequest).not.toHaveBeenCalled();
  });
});
