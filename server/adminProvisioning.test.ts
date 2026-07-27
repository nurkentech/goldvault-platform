import { describe, expect, it } from "vitest";
import { validateCredentials } from "../scripts/provision-admin.mjs";

describe("admin provisioning credential validation", () => {
  it("normalizes valid credentials without exposing them", () => {
    expect(validateCredentials({
      username: " admin ",
      email: " Admin@GoldVaults.us ",
      password: "temporary-123",
    })).toEqual({
      username: "admin",
      email: "admin@goldvaults.us",
      password: "temporary-123",
    });
  });

  it("rejects weak or malformed bootstrap credentials", () => {
    expect(() => validateCredentials({
      username: "a",
      email: "not-an-email",
      password: "short",
    })).toThrow();
  });
});
