import { useState, useEffect, useRef } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface TickerItem {
  symbol: string;
  price: number;
  change: number;
  flag?: string;
}

const CRYPTO_DEFAULTS: TickerItem[] = [
  { symbol: "🥇 XAU/USD", price: 2340.50, change: 1.24 },
  { symbol: "🥈 XAG/USD", price: 29.84, change: 0.87 },
  { symbol: "🪙 GVT/USD", price: 1.24, change: 12.50 },
  { symbol: "PAXG/USD", price: 2338.20, change: 1.18 },
  { symbol: "XAUT/USD", price: 2335.80, change: 1.05 },
  { symbol: "BTC/USD", price: 67420.50, change: 2.34 },
  { symbol: "ETH/USD", price: 3521.80, change: 1.87 },
  { symbol: "BNB/USD", price: 612.40, change: -0.54 },
  { symbol: "SOL/USD", price: 178.90, change: 4.21 },
  { symbol: "DOGE/USD", price: 0.1842, change: 3.15 },
  { symbol: "XRP/USD", price: 0.6234, change: -1.23 },
  { symbol: "USDT/USD", price: 1.0001, change: 0.01 },
  { symbol: "TON/USD", price: 7.82, change: 5.43 },
  { symbol: "AVAX/USD", price: 38.60, change: -2.87 },
];

const FX_DEFAULTS: TickerItem[] = [
  { symbol: "USD/NGN", price: 1580.00, change: 0.12, flag: "🇳🇬" },
  { symbol: "USD/EUR", price: 0.9234, change: -0.08, flag: "🇪🇺" },
  { symbol: "USD/GBP", price: 0.7891, change: -0.15, flag: "🇬🇧" },
  { symbol: "USD/CAD", price: 1.3621, change: 0.05, flag: "🇨🇦" },
  { symbol: "USD/AUD", price: 1.5234, change: 0.22, flag: "🇦🇺" },
  { symbol: "USD/JPY", price: 157.40, change: 0.31, flag: "🇯🇵" },
  { symbol: "USD/CHF", price: 0.8912, change: -0.04, flag: "🇨🇭" },
  { symbol: "USD/AED", price: 3.6725, change: 0.00, flag: "🇦🇪" },
  { symbol: "USD/CNY", price: 7.2410, change: 0.09, flag: "🇨🇳" },
  { symbol: "USD/INR", price: 83.45, change: 0.14, flag: "🇮🇳" },
];

function formatPrice(price: number): string {
  if (price < 0.01) return price.toFixed(6);
  if (price < 1) return price.toFixed(4);
  if (price < 100) return price.toFixed(2);
  return price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function TickerTrack({ items, speed = 40, reverse = false }: { items: TickerItem[]; speed?: number; reverse?: boolean }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const doubled = [...items, ...items];

  return (
    <div className="overflow-hidden relative">
      <div
        ref={trackRef}
        className="flex gap-0 whitespace-nowrap"
        style={{
          animation: `${reverse ? "tickerReverse" : "ticker"} ${items.length * speed}s linear infinite`,
        }}
      >
        {doubled.map((item, i) => (
          <div
            key={i}
            className="inline-flex items-center gap-2 px-5 border-r border-white/5 shrink-0"
          >
            {item.flag && <span className="text-sm">{item.flag}</span>}
            <span className="text-xs font-semibold text-slate-300">{item.symbol}</span>
            <span className="text-xs font-bold text-white">${formatPrice(item.price)}</span>
            <span className={`flex items-center gap-0.5 text-xs font-semibold ${item.change >= 0 ? "text-emerald-400" : "text-red-400"}`}>
              {item.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {item.change >= 0 ? "+" : ""}{item.change.toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DualTicker() {
  const [cryptoPrices, setCryptoPrices] = useState<TickerItem[]>(CRYPTO_DEFAULTS);
  const [fxRates, setFxRates] = useState<TickerItem[]>(FX_DEFAULTS);

  // Simulate live price updates
  useEffect(() => {
    const interval = setInterval(() => {
      setCryptoPrices(prev =>
        prev.map(item => ({
          ...item,
          price: item.price * (1 + (Math.random() - 0.498) * 0.002),
          change: item.change + (Math.random() - 0.5) * 0.1,
        }))
      );
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Fetch real crypto prices from CoinGecko
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const ids = "bitcoin,ethereum,binancecoin,solana,dogecoin,ripple,cardano,the-open-network,tron,litecoin,bitcoin-cash,avalanche-2";
        const res = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`,
          { signal: AbortSignal.timeout(5000) }
        );
        if (!res.ok) return;
        const data = await res.json();
        const mapping: Record<string, string> = {
          bitcoin: "BTC/USD", ethereum: "ETH/USD", binancecoin: "BNB/USD",
          solana: "SOL/USD", dogecoin: "DOGE/USD", ripple: "XRP/USD",
          cardano: "ADA/USD", "the-open-network": "TON/USD", tron: "TRX/USD",
          litecoin: "LTC/USD", "bitcoin-cash": "BCH/USD", "avalanche-2": "AVAX/USD",
        };
        setCryptoPrices(prev =>
          prev.map(item => {
            const id = Object.entries(mapping).find(([, sym]) => sym === item.symbol)?.[0];
            if (!id || !data[id]) return item;
            return {
              ...item,
              price: data[id].usd ?? item.price,
              change: data[id].usd_24h_change ?? item.change,
            };
          })
        );
      } catch {
        // Use defaults silently
      }
    };
    fetchPrices();
    const interval = setInterval(fetchPrices, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Crypto ticker */}
      <div className="bg-slate-900/80 backdrop-blur-sm border-b border-white/5 py-2.5">
        <div className="flex items-center">
          <div className="shrink-0 px-3 flex items-center gap-1.5 border-r border-white/10 mr-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Live</span>
          </div>
          <TickerTrack items={cryptoPrices} speed={35} />
        </div>
      </div>

      {/* FX ticker */}
      <div className="bg-slate-800/60 backdrop-blur-sm border-b border-white/5 py-2">
        <div className="flex items-center">
          <div className="shrink-0 px-3 flex items-center gap-1.5 border-r border-white/10 mr-2">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">FX</span>
          </div>
          <TickerTrack items={fxRates} speed={45} reverse />
        </div>
      </div>

      <style>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes tickerReverse {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
      `}</style>
    </>
  );
}
