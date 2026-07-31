export const LANGUAGES = ["en", "fr", "es", "ar", "pt"] as const;
export type Language = (typeof LANGUAGES)[number];

export const CURRENCIES = ["USD", "EUR", "GBP", "NGN"] as const;
export type PreferredCurrency = (typeof CURRENCIES)[number];

export const THEME_PREFERENCES = ["light", "dark", "system"] as const;
export type ThemePreference = (typeof THEME_PREFERENCES)[number];

function isOneOf<const T extends readonly string[]>(
  values: T,
  value: unknown,
): value is T[number] {
  return (
    typeof value === "string" &&
    (values as readonly string[]).includes(value)
  );
}

export function normalizeLanguage(value: unknown): Language {
  return isOneOf(LANGUAGES, value) ? value : "en";
}

export function normalizeCurrency(value: unknown): PreferredCurrency {
  return isOneOf(CURRENCIES, value) ? value : "USD";
}

export function normalizeThemePreference(value: unknown): ThemePreference {
  return isOneOf(THEME_PREFERENCES, value) ? value : "system";
}
