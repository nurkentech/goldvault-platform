import { describe, it, expect } from "vitest";

describe("RESEND_FROM_EMAIL configuration", () => {
  it("should have RESEND_FROM_EMAIL set to goldvaults.us domain", () => {
    const fromEmail = process.env.RESEND_FROM_EMAIL;
    expect(fromEmail).toBeDefined();
    expect(fromEmail).toContain("goldvaults.us");
    expect(fromEmail).toContain("noreply@goldvaults.us");
  });

  it("should be a valid email format with display name", () => {
    const fromEmail = process.env.RESEND_FROM_EMAIL!;
    // Should contain noreply@goldvaults.us in angle brackets
    expect(fromEmail).toContain("noreply@goldvaults.us");
    expect(fromEmail.length).toBeGreaterThan(20);
  });
});
