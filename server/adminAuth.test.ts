import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "./adminAuth";

describe("admin password authentication", () => {
  it("hashes and verifies the correct password", async () => {
    const hash = await hashPassword("Correct-Horse-42!");
    expect(hash).not.toContain("Correct-Horse-42!");
    await expect(verifyPassword("Correct-Horse-42!", hash)).resolves.toBe(true);
  });

  it("rejects an incorrect password", async () => {
    const hash = await hashPassword("Correct-Horse-42!");
    await expect(verifyPassword("wrong-password", hash)).resolves.toBe(false);
  });
});
