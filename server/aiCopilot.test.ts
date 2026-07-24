import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  assertCopilotRateLimit,
  calculatePortfolioScenario,
  redactSensitiveText,
  resetCopilotRateLimitsForTests,
  sanitizeStructuredResponse,
} from "./aiCopilot";

describe("GoldVault AI Copilot safety and calculations", () => {
  it("calculates deterministic market-shock scenarios without changing stable assets", () => {
    const result = calculatePortfolioScenario([
      { asset: "BTC", valueUsd: 10_000 },
      { asset: "USDC", valueUsd: 5_000 },
      { asset: "GOLD", valueUsd: 5_000 },
    ], -20);
    expect(result).toMatchObject({
      currentValueUsd: 20_000,
      projectedValueUsd: 17_000,
      changeUsd: -3_000,
      changePercent: -15,
    });
  });

  it("redacts common identifiers before model submission", () => {
    const redacted = redactSensitiveText(
      "Email me@example.com, call +1 202 555 0199, wallet 0x1234567890abcdef1234567890abcdef12345678",
    );
    expect(redacted).not.toContain("me@example.com");
    expect(redacted).not.toContain("202 555");
    expect(redacted).not.toContain("0x123456");
    expect(redacted).toContain("[REDACTED_EMAIL]");
  });

  it("drops model-suggested external actions and normalizes unknown sources", () => {
    const result = sanitizeStructuredResponse({
      answer: "Review the concentration.",
      summary: "Concentration review",
      insights: [],
      actions: [
        { label: "Portfolio", href: "/dashboard/wallets" },
        { label: "External", href: "https://example.com/trade" },
      ],
      sources: [{ label: "Unknown", reference: "https://example.com" }],
      disclaimer: "Educational information only.",
    });
    expect(result.actions).toEqual([{ label: "Portfolio", href: "/dashboard/wallets" }]);
    expect(result.sources[0]?.reference).toBe("provided_context");
  });

  it("enforces the per-actor request window", () => {
    resetCopilotRateLimitsForTests();
    for (let index = 0; index < 12; index += 1) assertCopilotRateLimit("user:1", 1_000);
    expect(() => assertCopilotRateLimit("user:1", 1_000)).toThrow(/request limit/i);
  });

  it("keeps the provider server-side and explicitly disables provider storage", () => {
    const source = readFileSync(new URL("./aiCopilot.ts", import.meta.url), "utf8");
    expect(source).toContain('process.env.OPENAI_API_KEY');
    expect(source).toContain('store: false');
    expect(source).toContain('https://api.openai.com/v1/responses');
    expect(source).not.toContain('console.log(apiKey');
    expect(source).not.toMatch(/tools\s*:/);
  });
});
