import { describe, expect, it } from "vitest";
import { calculateMaturityPayout } from "./investmentMaturity";
import { calculateWithdrawalDebit } from "./adminDb";

describe("financial calculations", () => {
  it("returns investment principal, profit and total payout", () => {
    expect(calculateMaturityPayout("1000", "12.5")).toEqual({ principal: 1000, profit: 125, total: 1125 });
  });

  it("rejects invalid investment inputs", () => {
    expect(() => calculateMaturityPayout("NaN", 10)).toThrow();
    expect(() => calculateMaturityPayout(100, -1)).toThrow();
  });

  it("includes the withdrawal fee in the atomic debit", () => {
    expect(calculateWithdrawalDebit("20.5", "0.25")).toBe(20.75);
  });

  it("rejects non-positive or negative-fee withdrawals", () => {
    expect(() => calculateWithdrawalDebit(0, 0)).toThrow();
    expect(() => calculateWithdrawalDebit(10, -1)).toThrow();
  });
});
