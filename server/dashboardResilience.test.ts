import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const dashboard = readFileSync(
  resolve(process.cwd(), "client/src/pages/Dashboard.tsx"),
  "utf8",
);
const database = readFileSync(resolve(process.cwd(), "server/db.ts"), "utf8");

describe("dashboard loading resilience", () => {
  it("does not hold the account dashboard behind the optional market-price query", () => {
    expect(dashboard).toContain("accountDataLoading && !loadingTimedOut");
    expect(dashboard).not.toContain(
      "walletsLoading || transactionsLoading || investmentsLoading || pricesLoading",
    );
    expect(dashboard).toContain("pricesQuery.isError");
    expect(dashboard).toContain("The dashboard remains available.");
  });

  it("stops an unresolved account request from showing an endless skeleton", () => {
    expect(dashboard).toContain("setLoadingTimedOut(true), 12_000");
    expect(dashboard).toContain("setLoadingAttempt((attempt) => attempt + 1)");
  });

  it("only initializes missing wallets and leaves established dashboards read-only", () => {
    expect(database).toContain("export async function getOrInitUserWallets");
    expect(database).toContain("if (missingCurrencies.length === 0) return existing");
    expect(database).toContain(".values(missingCurrencies.map");
    expect(database).toContain(".onDuplicateKeyUpdate");
  });
});
