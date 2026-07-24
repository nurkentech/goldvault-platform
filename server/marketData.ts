export interface MarketPrice {
  symbol: "GOLD" | "BTC" | "ETH" | "SOL" | "USDT" | "USDC";
  name: string;
  price: number;
  change24h: number | null;
  icon: string;
}

let cachedPrices: MarketPrice[] | null = null;
let cacheExpiresAt = 0;

export interface FiatRates {
  base: "USD";
  rates: Record<"USD" | "EUR" | "GBP" | "NGN", number>;
  updatedAt: string;
}

let cachedFiatRates: FiatRates | null = null;
let fiatCacheExpiresAt = 0;

export async function getFiatRates(): Promise<FiatRates> {
  if (cachedFiatRates && Date.now() < fiatCacheExpiresAt) return cachedFiatRates;
  try {
    const response = await fetch("https://open.er-api.com/v6/latest/USD", {
      signal: AbortSignal.timeout(8_000),
    });
    if (!response.ok) throw new Error(`FX provider returned ${response.status}`);
    const body = await response.json() as { rates?: Record<string, unknown>; time_last_update_utc?: string };
    const rates = body.rates ?? {};
    const next: FiatRates = {
      base: "USD",
      rates: {
        USD: 1,
        EUR: asFiniteNumber(rates.EUR) ?? cachedFiatRates?.rates.EUR ?? 0.92,
        GBP: asFiniteNumber(rates.GBP) ?? cachedFiatRates?.rates.GBP ?? 0.79,
        NGN: asFiniteNumber(rates.NGN) ?? cachedFiatRates?.rates.NGN ?? 1550,
      },
      updatedAt: body.time_last_update_utc ?? new Date().toISOString(),
    };
    cachedFiatRates = next;
    fiatCacheExpiresAt = Date.now() + 60 * 60 * 1000;
    return next;
  } catch (error) {
    if (cachedFiatRates) return cachedFiatRates;
    console.warn("Using conservative FX fallbacks:", error);
    return {
      base: "USD",
      rates: { USD: 1, EUR: 0.92, GBP: 0.79, NGN: 1550 },
      updatedAt: new Date().toISOString(),
    };
  }
}

function asFiniteNumber(value: unknown): number | null {
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) ? number : null;
}

async function fetchGoldPrice(): Promise<number> {
  const response = await fetch("https://api.metals.live/v1/spot/gold", {
    signal: AbortSignal.timeout(8_000),
  });
  if (!response.ok) throw new Error(`Gold provider returned ${response.status}`);

  const payload = (await response.json()) as unknown;
  const record = (Array.isArray(payload) ? payload[0] : payload) as
    | { price?: unknown; gold?: unknown }
    | undefined;
  const price = asFiniteNumber(record?.price ?? record?.gold);
  if (price === null) throw new Error("Gold provider returned an invalid payload");
  return price;
}

export async function getLiveMarketPrices(): Promise<MarketPrice[]> {
  if (cachedPrices && Date.now() < cacheExpiresAt) return cachedPrices;

  const [cryptoResponse, goldPrice] = await Promise.all([
    fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,tether,usd-coin&vs_currencies=usd&include_24hr_change=true",
      { signal: AbortSignal.timeout(8_000) },
    ),
    fetchGoldPrice(),
  ]);
  if (!cryptoResponse.ok) {
    throw new Error(`Crypto provider returned ${cryptoResponse.status}`);
  }

  const crypto = (await cryptoResponse.json()) as Record<
    string,
    { usd?: number; usd_24h_change?: number }
  >;
  const assets: Array<[
    "BTC" | "ETH" | "SOL" | "USDT" | "USDC",
    string,
    string,
    string,
  ]> = [
    ["BTC", "Bitcoin", "bitcoin", "₿"],
    ["ETH", "Ethereum", "ethereum", "Ξ"],
    ["SOL", "Solana", "solana", "◎"],
    ["USDT", "Tether", "tether", "₮"],
    ["USDC", "USD Coin", "usd-coin", "$"],
  ];

  const cryptoPrices: MarketPrice[] = assets.map(([symbol, name, id, icon]) => {
    const price = asFiniteNumber(crypto[id]?.usd);
    if (price === null) throw new Error(`Missing ${symbol} price`);
    return {
      symbol,
      name,
      price,
      change24h: asFiniteNumber(crypto[id]?.usd_24h_change),
      icon,
    };
  });

  cachedPrices = [
    {
      symbol: "GOLD",
      name: "Gold (USD/oz)",
      price: goldPrice,
      change24h: null,
      icon: "🥇",
    },
    ...cryptoPrices,
  ];
  cacheExpiresAt = Date.now() + 30_000;
  return cachedPrices;
}
