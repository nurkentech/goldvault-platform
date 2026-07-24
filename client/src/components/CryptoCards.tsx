import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { openSignUpModal } from "@/pages/Home";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, ShoppingCart, ArrowLeftRight } from "lucide-react";
import { LineChart, Line, ResponsiveContainer, Tooltip } from "recharts";

interface CryptoCardData {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  marketCap: string;
  volume: string;
  sparkline: number[];
  color: string;
  emoji: string;
}

const CRYPTO_DATA: CryptoCardData[] = [
  { id: "bitcoin", symbol: "BTC", name: "Bitcoin", price: 67420.50, change24h: 2.34, marketCap: "$1.32T", volume: "$28.4B", sparkline: [64000, 65200, 64800, 66100, 65900, 67000, 66800, 67420], color: "#f59e0b", emoji: "₿" },
  { id: "ethereum", symbol: "ETH", name: "Ethereum", price: 3521.80, change24h: 1.87, marketCap: "$423B", volume: "$14.2B", sparkline: [3300, 3380, 3420, 3390, 3450, 3480, 3510, 3522], color: "#6366f1", emoji: "Ξ" },
  { id: "solana", symbol: "SOL", name: "Solana", price: 178.90, change24h: 4.21, marketCap: "$82B", volume: "$3.8B", sparkline: [162, 165, 168, 171, 169, 174, 177, 179], color: "#8b5cf6", emoji: "◎" },
  { id: "binancecoin", symbol: "BNB", name: "BNB", price: 612.40, change24h: -0.54, marketCap: "$91B", volume: "$1.9B", sparkline: [618, 615, 614, 616, 613, 611, 612, 612], color: "#eab308", emoji: "⬡" },
  { id: "ripple", symbol: "XRP", name: "XRP", price: 0.6234, change24h: -1.23, marketCap: "$34B", volume: "$1.2B", sparkline: [0.64, 0.635, 0.628, 0.631, 0.625, 0.622, 0.624, 0.623], color: "#06b6d4", emoji: "✕" },
  { id: "dogecoin", symbol: "DOGE", name: "Dogecoin", price: 0.1842, change24h: 3.15, marketCap: "$26B", volume: "$1.8B", sparkline: [0.172, 0.175, 0.178, 0.180, 0.182, 0.183, 0.184, 0.184], color: "#f97316", emoji: "Ð" },
];

function SparklineChart({ data, color, positive }: { data: number[]; color: string; positive: boolean }) {
  const chartData = data.map((v, i) => ({ v, i }));
  return (
    <ResponsiveContainer width="100%" height={48}>
      <LineChart data={chartData}>
        <Line
          type="monotone"
          dataKey="v"
          stroke={positive ? "#10b981" : "#ef4444"}
          strokeWidth={1.5}
          dot={false}
          isAnimationActive={false}
        />
        <Tooltip
          content={() => null}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default function CryptoCards() {
  const [cards, setCards] = useState<CryptoCardData[]>(CRYPTO_DATA);
  const [, navigate] = useLocation();

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const ids = CRYPTO_DATA.map(c => c.id).join(",");
        const res = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true&include_24hr_vol=true`,
          { signal: AbortSignal.timeout(5000) }
        );
        if (!res.ok) return;
        const data = await res.json();
        setCards(prev =>
          prev.map(card => {
            const d = data[card.id];
            if (!d) return card;
            return {
              ...card,
              price: d.usd ?? card.price,
              change24h: d.usd_24h_change ?? card.change24h,
              marketCap: d.usd_market_cap ? `$${(d.usd_market_cap / 1e9).toFixed(0)}B` : card.marketCap,
              volume: d.usd_24h_vol ? `$${(d.usd_24h_vol / 1e9).toFixed(1)}B` : card.volume,
              sparkline: [...card.sparkline.slice(1), d.usd ?? card.price],
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
    <section id="markets" className="bg-slate-900 py-16">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-6">
        <div className="flex items-end justify-between mb-8">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-amber-400 text-sm font-semibold uppercase tracking-wider mb-2"
            >
              Live Markets
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-3xl font-black text-white"
            >
              Top Cryptocurrencies
            </motion.h2>
          </div>
          <motion.button
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            onClick={() => navigate("/markets")}
            className="text-sm text-amber-400 hover:text-amber-300 font-medium transition-colors"
          >
            View All Markets →
          </motion.button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((card, i) => {
            const positive = card.change24h >= 0;
            return (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                whileHover={{ y: -4, scale: 1.01 }}
                className="group bg-slate-800/60 hover:bg-slate-800 border border-white/8 hover:border-amber-400/20 rounded-2xl p-5 transition-all duration-300 cursor-pointer"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold shadow-lg"
                      style={{ background: `${card.color}20`, color: card.color }}
                    >
                      {card.emoji}
                    </div>
                    <div>
                      <div className="font-bold text-white text-sm">{card.name}</div>
                      <div className="text-xs text-slate-400">{card.symbol}</div>
                    </div>
                  </div>
                  <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${
                    positive ? "bg-emerald-400/10 text-emerald-400" : "bg-red-400/10 text-red-400"
                  }`}>
                    {positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {positive ? "+" : ""}{card.change24h.toFixed(2)}%
                  </div>
                </div>

                {/* Price */}
                <div className="mb-3">
                  <div className="text-2xl font-black text-white">
                    ${card.price < 1 ? card.price.toFixed(4) : card.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>

                {/* Sparkline */}
                <div className="mb-3 -mx-1">
                  <SparklineChart data={card.sparkline} color={card.color} positive={positive} />
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
                  <div>
                    <div className="text-slate-500">Market Cap</div>
                    <div className="text-slate-300 font-semibold">{card.marketCap}</div>
                  </div>
                  <div>
                    <div className="text-slate-500">24h Volume</div>
                    <div className="text-slate-300 font-semibold">{card.volume}</div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); openSignUpModal("signup"); }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-900 text-xs font-bold transition-all active:scale-[0.97]"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    Buy
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); navigate(`/trade?pair=${card.symbol}`); }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-white/10 hover:border-amber-400/30 text-slate-300 hover:text-amber-400 text-xs font-semibold transition-all active:scale-[0.97]"
                  >
                    <ArrowLeftRight className="w-3.5 h-3.5" />
                    Trade
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
