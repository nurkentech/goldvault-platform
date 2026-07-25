import { eq } from "drizzle-orm";
import { platformSettings } from "../drizzle/schema";
import { getDb } from "./db";

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
}

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
};

function mergeSettings(settings: unknown): PlatformSettingsInput {
  const stored = settings as Partial<PlatformSettingsInput> | null;
  return {
    ...DEFAULT_PLATFORM_SETTINGS,
    ...stored,
    general: { ...DEFAULT_PLATFORM_SETTINGS.general, ...stored?.general },
    fees: { ...DEFAULT_PLATFORM_SETTINGS.fees, ...stored?.fees },
    security: { ...DEFAULT_PLATFORM_SETTINGS.security, ...stored?.security },
    notifications: { ...DEFAULT_PLATFORM_SETTINGS.notifications, ...stored?.notifications },
    maintenance: { ...DEFAULT_PLATFORM_SETTINGS.maintenance, ...stored?.maintenance },
    compliance: { ...DEFAULT_PLATFORM_SETTINGS.compliance, ...stored?.compliance },
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
