import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  normalizeCurrency,
  normalizeLanguage,
  normalizeThemePreference,
} from "../client/src/lib/preferences";

const read = (path: string) =>
  readFileSync(resolve(process.cwd(), path), "utf8");

describe("dashboard shell safety", () => {
  it("normalizes stale or malformed browser preferences", () => {
    expect(normalizeLanguage("fr")).toBe("fr");
    expect(normalizeLanguage("EN")).toBe("en");
    expect(normalizeLanguage(null)).toBe("en");
    expect(normalizeCurrency("GBP")).toBe("GBP");
    expect(normalizeCurrency("BTC")).toBe("USD");
    expect(normalizeThemePreference("dark")).toBe("dark");
    expect(normalizeThemePreference("midnight")).toBe("system");
  });

  it("guards dashboard shell API collections and numeric values", () => {
    const layout = read("client/src/components/UserDashboardLayout.tsx");
    const notifications = read("client/src/components/NotificationDropdown.tsx");
    expect(layout).toContain("Array.isArray(livePricesQuery.data)");
    expect(layout).toContain("formatTickerPrice(pair.price)");
    expect(layout).toContain("formatTickerChange(pair.change24h)");
    expect(notifications).toContain("Array.isArray(notificationsQuery.data)");
  });

  it("never indexes translations with an unvalidated stored value", () => {
    const i18n = read("client/src/contexts/I18nContext.tsx");
    expect(i18n).toContain(
      'normalizeLanguage(localStorage.getItem("language"))',
    );
    expect(i18n).toContain("labels[safeLanguage][key]");
    expect(i18n).toContain("labels.en[key] ?? key");
  });
});
