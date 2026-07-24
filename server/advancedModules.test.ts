import { describe, expect, it } from "vitest";
import { calculateFifoCapitalGains, calculateStakingRedemption, tierForVolume } from "./advancedModules";
import { generateVapidKeys } from "./pushNotifications";

describe("advanced financial modules", () => {
  it("calculates a matured staking payout without a penalty", () => {
    const startsAt = new Date("2025-01-01T00:00:00Z");
    const unlocksAt = new Date("2026-01-01T00:00:00Z");
    expect(calculateStakingRedemption({ amount: 1000, apy: 10, startsAt, unlocksAt, now: unlocksAt })).toMatchObject({ yieldEarned: 100, penalty: 0, payout: 1100, early: false });
  });

  it("applies the five-percent early staking penalty", () => {
    const startsAt = new Date("2025-01-01T00:00:00Z");
    const unlocksAt = new Date("2026-01-01T00:00:00Z");
    const result = calculateStakingRedemption({ amount: 1000, apy: 10, startsAt, unlocksAt, now: new Date("2025-07-02T12:00:00Z") });
    expect(result.early).toBe(true); expect(result.penalty).toBe(50); expect(result.payout).toBeCloseTo(1000, 5);
  });

  it("assigns loyalty tiers and their perks by volume", () => {
    expect(tierForVolume(0)).toMatchObject({ tier: "bronze", feeDiscount: 0 });
    expect(tierForVolume(10_000)).toMatchObject({ tier: "silver", feeDiscount: 10 });
    expect(tierForVolume(50_000)).toMatchObject({ tier: "gold", prioritySupport: true });
    expect(tierForVolume(250_000)).toMatchObject({ tier: "platinum", exclusivePlans: true });
  });

  it("uses FIFO acquisition lots for capital gains", () => {
    const rows = [
      { id: 1, type: "buy", currency: "BTC", amount: "1", createdAt: new Date("2025-01-01"), metadata: { unitPriceUsd: 20_000 } },
      { id: 2, type: "buy", currency: "BTC", amount: "1", createdAt: new Date("2025-02-01"), metadata: { unitPriceUsd: 30_000 } },
      { id: 3, type: "sell", currency: "BTC", amount: "1.5", createdAt: new Date("2025-03-01"), metadata: { unitPriceUsd: 40_000 } },
    ];
    expect(calculateFifoCapitalGains(rows)).toEqual([{ transactionId: 3, date: new Date("2025-03-01").toISOString(), asset: "BTC", quantity: 1.5, proceeds: 60_000, costBasis: 35_000, gainLoss: 25_000 }]);
  });

  it("generates valid P-256 VAPID key material", () => {
    const keys = generateVapidKeys();
    expect(Buffer.from(keys.publicKey, "base64url")).toHaveLength(65);
    expect(Buffer.from(keys.privateKey, "base64url")).toHaveLength(32);
  });
});
