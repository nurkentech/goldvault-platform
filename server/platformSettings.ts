import { eq } from "drizzle-orm";
import { platformSettings } from "../drizzle/schema";
import { getDb } from "./db";

export interface WebsitePageInput {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  seoTitle: string;
  seoDescription: string;
  status: "draft" | "published";
  showInNavigation: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

export interface WebsiteHeroStatInput {
  label: string;
  value: string;
}

export interface WebsiteHeroSlideInput {
  id: string;
  enabled: boolean;
  badge: string;
  title: string;
  titleAccent: string;
  subtitle: string;
  primaryCtaLabel: string;
  primaryCtaUrl: string;
  secondaryCtaLabel: string;
  secondaryCtaUrl: string;
  heroImageUrl: string;
  stats: WebsiteHeroStatInput[];
}

export interface WebsiteContentInput {
  branding: {
    siteName: string;
    tagline: string;
    logoUrl: string;
    logoAlt: string;
  };
  home: {
    badge: string;
    title: string;
    titleAccent: string;
    subtitle: string;
    primaryCtaLabel: string;
    secondaryCtaLabel: string;
    secondaryCtaUrl: string;
    heroImageUrl: string;
    slides: WebsiteHeroSlideInput[];
  };
  pages: WebsitePageInput[];
}

export interface PlatformSettingsInput {
  general: {
    platformName: string;
    supportEmail: string;
    defaultCurrency: "USD" | "EUR" | "GBP" | "NGN";
    timezone: string;
    enableRegistrations: boolean;
    requireEmailVerification: boolean;
  };
  fees: {
    tradingFee: string;
    withdrawalFee: string;
    depositFee: string;
    minDeposit: string;
    maxWithdrawal: string;
    dailyWithdrawalLimit: string;
  };
  security: {
    requireKycForWithdrawals: boolean;
    enforce2faAdmin: boolean;
    autoLockSuspicious: boolean;
    ipWhitelist: boolean;
  };
  notifications: {
    emailOnRegistration: boolean;
    emailOnLargeWithdrawal: boolean;
    emailOnKycSubmission: boolean;
    dailySummary: boolean;
  };
  maintenance: { enabled: boolean; message: string; startTime: string; endTime: string };
  supportedAssets: string[];
  depositAddresses: Record<string, string>;
  compliance: { largeTransactionThreshold: string; rapidWithdrawalCount: number; rapidWithdrawalWindowMinutes: number };
  website: WebsiteContentInput;
}

export const DEFAULT_HERO_SLIDES: WebsiteHeroSlideInput[] = [
  {
    id: "gold-with-crypto",
    enabled: true,
    badge: "The Gold Standard of Crypto Investing",
    title: "Buy Physical Gold",
    titleAccent: "With Crypto",
    subtitle: "Convert supported cryptocurrencies into available gold products and manage them from your GoldVaults account.",
    primaryCtaLabel: "Get Started",
    primaryCtaUrl: "#signup",
    secondaryCtaLabel: "View Gold Prices",
    secondaryCtaUrl: "/markets",
    heroImageUrl: "/manus-storage/hero-bg_ff436ad1.jpg",
    stats: [
      { label: "Account protection", value: "2FA" },
      { label: "Market access", value: "24/7" },
      { label: "Portfolio view", value: "Unified" },
    ],
  },
  {
    id: "portfolio-tools",
    enabled: true,
    badge: "Gold and Crypto Account Tools",
    title: "Manage Your",
    titleAccent: "Digital Portfolio",
    subtitle: "Review wallets, market information, transactions, rewards, and available investment tools in one secure account.",
    primaryCtaLabel: "Open Dashboard",
    primaryCtaUrl: "/dashboard",
    secondaryCtaLabel: "Explore Markets",
    secondaryCtaUrl: "/markets",
    heroImageUrl: "/manus-storage/hero-bg_ff436ad1.jpg",
    stats: [
      { label: "Wallet tools", value: "Live" },
      { label: "Market data", value: "Current" },
      { label: "Account history", value: "Tracked" },
    ],
  },
  {
    id: "research-and-security",
    enabled: true,
    badge: "Research Before You Invest",
    title: "Make Informed",
    titleAccent: "Asset Decisions",
    subtitle: "Use market, security, and educational resources to understand products and risks before making an investment decision.",
    primaryCtaLabel: "How It Works",
    primaryCtaUrl: "/how-it-works",
    secondaryCtaLabel: "Security Overview",
    secondaryCtaUrl: "/security",
    heroImageUrl: "/manus-storage/hero-bg_ff436ad1.jpg",
    stats: [
      { label: "Risk information", value: "Available" },
      { label: "Security controls", value: "Enabled" },
      { label: "Support", value: "Accessible" },
    ],
  },
];

export const DEFAULT_WEBSITE_CONTENT: WebsiteContentInput = {
  branding: {
    siteName: "GoldVaults",
    tagline: "Global Financial Freedom",
    logoUrl: "",
    logoAlt: "GoldVaults logo",
  },
  home: {
    badge: "The Gold Standard of Crypto Investing",
    title: "Buy Physical Gold",
    titleAccent: "With Crypto",
    subtitle:
      "Convert Bitcoin, Ethereum, USDT and 300+ cryptocurrencies into real, audited, vault-stored gold bars.",
    primaryCtaLabel: "Buy Gold Now",
    secondaryCtaLabel: "View Gold Prices",
    secondaryCtaUrl: "/markets",
    heroImageUrl: "/manus-storage/hero-bg_ff436ad1.jpg",
    slides: DEFAULT_HERO_SLIDES,
  },
  pages: [],
};

export const DEFAULT_PLATFORM_SETTINGS: PlatformSettingsInput = {
  general: {
    platformName: "GoldVaults",
    supportEmail: "support@goldvaults.us",
    defaultCurrency: "USD",
    timezone: "UTC",
    enableRegistrations: true,
    requireEmailVerification: true,
  },
  fees: {
    tradingFee: "0.5",
    withdrawalFee: "1.0",
    depositFee: "0",
    minDeposit: "10",
    maxWithdrawal: "50000",
    dailyWithdrawalLimit: "10000",
  },
  security: {
    requireKycForWithdrawals: true,
    enforce2faAdmin: false,
    autoLockSuspicious: false,
    ipWhitelist: false,
  },
  notifications: {
    emailOnRegistration: true,
    emailOnLargeWithdrawal: true,
    emailOnKycSubmission: true,
    dailySummary: false,
  },
  maintenance: {
    enabled: false,
    message: "We are performing scheduled maintenance. Please check back soon.",
    startTime: "",
    endTime: "",
  },
  supportedAssets: ["BTC", "ETH", "USDT", "USDC", "SOL", "GVT", "PAXG", "XAUT"],
  depositAddresses: {},
  compliance: { largeTransactionThreshold: "10000", rapidWithdrawalCount: 3, rapidWithdrawalWindowMinutes: 60 },
  website: DEFAULT_WEBSITE_CONTENT,
};

function mergeSettings(settings: unknown): PlatformSettingsInput {
  const stored = settings as Partial<PlatformSettingsInput> | null;
  const storedHome = stored?.website?.home;
  const mergedHome = {
    ...DEFAULT_WEBSITE_CONTENT.home,
    ...storedHome,
  };
  const fallbackSlides = DEFAULT_HERO_SLIDES.map((slide, index) =>
    index === 0
      ? {
          ...slide,
          badge: mergedHome.badge,
          title: mergedHome.title,
          titleAccent: mergedHome.titleAccent,
          subtitle: mergedHome.subtitle,
          primaryCtaLabel: mergedHome.primaryCtaLabel,
          secondaryCtaLabel: mergedHome.secondaryCtaLabel,
          secondaryCtaUrl: mergedHome.secondaryCtaUrl,
          heroImageUrl: mergedHome.heroImageUrl || slide.heroImageUrl,
        }
      : { ...slide, stats: slide.stats.map((stat) => ({ ...stat })) },
  );
  const slides = Array.isArray(storedHome?.slides) && storedHome.slides.length > 0
    ? storedHome.slides.slice(0, 5).map((slide, index) => {
        const fallback = DEFAULT_HERO_SLIDES[index % DEFAULT_HERO_SLIDES.length];
        return {
          ...fallback,
          ...slide,
          stats: Array.isArray(slide.stats) && slide.stats.length > 0
            ? slide.stats.slice(0, 3)
            : fallback.stats.map((stat) => ({ ...stat })),
        };
      })
    : fallbackSlides;
  return {
    ...DEFAULT_PLATFORM_SETTINGS,
    ...stored,
    general: { ...DEFAULT_PLATFORM_SETTINGS.general, ...stored?.general },
    fees: { ...DEFAULT_PLATFORM_SETTINGS.fees, ...stored?.fees },
    security: { ...DEFAULT_PLATFORM_SETTINGS.security, ...stored?.security },
    notifications: { ...DEFAULT_PLATFORM_SETTINGS.notifications, ...stored?.notifications },
    maintenance: { ...DEFAULT_PLATFORM_SETTINGS.maintenance, ...stored?.maintenance },
    compliance: { ...DEFAULT_PLATFORM_SETTINGS.compliance, ...stored?.compliance },
    website: {
      ...DEFAULT_WEBSITE_CONTENT,
      ...stored?.website,
      branding: {
        ...DEFAULT_WEBSITE_CONTENT.branding,
        ...stored?.website?.branding,
      },
      home: {
        ...mergedHome,
        slides,
      },
      pages: Array.isArray(stored?.website?.pages)
        ? stored.website.pages
        : DEFAULT_WEBSITE_CONTENT.pages,
    },
    supportedAssets: Array.isArray(stored?.supportedAssets)
      ? stored.supportedAssets
      : DEFAULT_PLATFORM_SETTINGS.supportedAssets,
    depositAddresses:
      stored?.depositAddresses && typeof stored.depositAddresses === "object"
        ? stored.depositAddresses
        : DEFAULT_PLATFORM_SETTINGS.depositAddresses,
  };
}

export async function getPlatformSettings(): Promise<PlatformSettingsInput> {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");

  const [record] = await db
    .select()
    .from(platformSettings)
    .where(eq(platformSettings.id, 1))
    .limit(1);

  if (record) return mergeSettings(record.settings);

  await db
    .insert(platformSettings)
    .values({ id: 1, settings: DEFAULT_PLATFORM_SETTINGS })
    .onDuplicateKeyUpdate({ set: { settings: DEFAULT_PLATFORM_SETTINGS } });
  return DEFAULT_PLATFORM_SETTINGS;
}

export async function savePlatformSettings(
  settings: PlatformSettingsInput,
): Promise<PlatformSettingsInput> {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");

  const normalized = mergeSettings(settings);
  await db
    .insert(platformSettings)
    .values({ id: 1, settings: normalized })
    .onDuplicateKeyUpdate({ set: { settings: normalized } });
  return normalized;
}
