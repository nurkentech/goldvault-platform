import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, ExternalLink, Shield, Lock, Eye, Server, FileCheck, Fingerprint } from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

// ─── Market Movers ───────────────────────────────────────────────────────────
const MARKET_TABS = ["Top Gainers", "Top Losers", "Trending", "New Listings"];

const MARKET_DATA = {
  "Top Gainers": [
    { symbol: "TON", name: "Toncoin", price: 7.82, change: 5.43, vol: "$890M" },
    { symbol: "SOL", name: "Solana", price: 178.90, change: 4.21, vol: "$3.8B" },
    { symbol: "DOGE", name: "Dogecoin", price: 0.1842, change: 3.15, vol: "$1.8B" },
    { symbol: "BTC", name: "Bitcoin", price: 67420, change: 2.34, vol: "$28.4B" },
    { symbol: "ETH", name: "Ethereum", price: 3521, change: 1.87, vol: "$14.2B" },
  ],
  "Top Losers": [
    { symbol: "AVAX", name: "Avalanche", price: 38.60, change: -2.87, vol: "$620M" },
    { symbol: "XRP", name: "XRP", price: 0.6234, change: -1.23, vol: "$1.2B" },
    { symbol: "BNB", name: "BNB", price: 612.40, change: -0.54, vol: "$1.9B" },
    { symbol: "TRX", name: "Tron", price: 0.1234, change: -0.32, vol: "$480M" },
    { symbol: "ADA", name: "Cardano", price: 0.4521, change: -0.18, vol: "$340M" },
  ],
  "Trending": [
    { symbol: "BTC", name: "Bitcoin", price: 67420, change: 2.34, vol: "$28.4B" },
    { symbol: "ETH", name: "Ethereum", price: 3521, change: 1.87, vol: "$14.2B" },
    { symbol: "SOL", name: "Solana", price: 178.90, change: 4.21, vol: "$3.8B" },
    { symbol: "TON", name: "Toncoin", price: 7.82, change: 5.43, vol: "$890M" },
    { symbol: "DOGE", name: "Dogecoin", price: 0.1842, change: 3.15, vol: "$1.8B" },
  ],
  "New Listings": [
    { symbol: "GVT", name: "GoldVault Token", price: 1.24, change: 12.50, vol: "$42M" },
    { symbol: "PAXG", name: "PAX Gold", price: 2180, change: 1.20, vol: "$28M" },
    { symbol: "XAUT", name: "Tether Gold", price: 2175, change: 0.95, vol: "$19M" },
    { symbol: "AAAU", name: "Perth Mint Gold", price: 21.80, change: 0.88, vol: "$8M" },
    { symbol: "SGOL", name: "Aberdeen Gold", price: 21.75, change: 0.76, vol: "$6M" },
  ],
};

export function MarketMovers() {
  const [activeTab, setActiveTab] = useState("Top Gainers");
  const data = MARKET_DATA[activeTab as keyof typeof MARKET_DATA];
  const [, navigate] = useLocation();

  return (
    <section id="markets" className="bg-slate-900 py-16">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <p className="text-amber-400 text-sm font-semibold uppercase tracking-wider mb-1">Market Data</p>
            <h2 className="text-3xl font-black text-white">Market Movers</h2>
          </div>
          <div className="flex gap-1 bg-slate-800 rounded-xl p-1">
            {MARKET_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === tab ? "bg-amber-500 text-slate-900" : "text-slate-400 hover:text-white"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-slate-800/60 border border-white/8 rounded-2xl overflow-hidden">
          <div className="grid grid-cols-4 gap-4 px-5 py-3 border-b border-white/8 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <span>Asset</span>
            <span className="text-right">Price</span>
            <span className="text-right">24h Change</span>
            <span className="text-right">Volume</span>
          </div>
          {data.map((item, i) => {
            const positive = item.change >= 0;
            return (
              <motion.div
                key={item.symbol}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => navigate(`/trade?pair=${item.symbol}`)}
                className="grid grid-cols-4 gap-4 px-5 py-4 border-b border-white/5 last:border-0 hover:bg-white/4 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-400/10 flex items-center justify-center text-sm font-black text-amber-400">
                    {item.symbol[0]}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">{item.symbol}</div>
                    <div className="text-xs text-slate-500">{item.name}</div>
                  </div>
                </div>
                <div className="text-right text-sm font-semibold text-white self-center">
                  ${item.price < 1 ? item.price.toFixed(4) : item.price.toLocaleString()}
                </div>
                <div className={`text-right text-sm font-bold self-center flex items-center justify-end gap-1 ${positive ? "text-emerald-400" : "text-red-400"}`}>
                  {positive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                  {positive ? "+" : ""}{item.change.toFixed(2)}%
                </div>
                <div className="text-right text-sm text-slate-400 self-center">{item.vol}</div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── News Section ────────────────────────────────────────────────────────────
export function NewsSection() {
  const [, navigate] = useLocation();
  const news = trpc.advanced.blog.list.useQuery({ limit: 6 });
  const posts = Array.isArray(news.data) ? news.data : [];
  return (
    <section id="news" className="bg-slate-800/40 py-16">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-6">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-amber-400 text-sm font-semibold uppercase tracking-wider mb-1">Latest Updates</p>
            <h2 className="text-3xl font-black text-white">News & Insights</h2>
          </div>
          <button onClick={() => navigate("/blog")} className="text-sm text-amber-400 hover:text-amber-300 font-medium transition-colors">
            View All News →
          </button>
        </div>

        {news.isLoading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">{[1, 2, 3].map((item) => <div key={item} className="h-72 animate-pulse rounded-2xl bg-slate-800" />)}</div>
        ) : posts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-slate-900/40 p-12 text-center"><p className="font-semibold text-white">No news has been published yet.</p><p className="mt-1 text-sm text-slate-500">Published Blog CMS articles will appear here automatically.</p></div>
        ) : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {posts.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -4 }}
              onClick={() => navigate(`/blog/${item.slug}`)}
              className="group bg-slate-800 border border-white/8 hover:border-amber-400/20 rounded-2xl overflow-hidden cursor-pointer transition-all"
            >
              <div className="relative h-44 overflow-hidden">
                {item.coverImageUrl ? <img src={item.coverImageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" /> : <div className="h-full w-full bg-gradient-to-br from-amber-500/20 via-slate-800 to-blue-500/15" />}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-amber-500/90 text-slate-900 text-xs font-bold">
                  News
                </span>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-amber-400">GoldVaults</span>
                  <span className="text-xs text-slate-500">{new Date(item.publishedAt || item.createdAt).toLocaleDateString()}</span>
                </div>
                <h3 className="text-sm font-bold text-white leading-snug group-hover:text-amber-400 transition-colors line-clamp-2 mb-3">
                  {item.title}
                </h3>
                <button onClick={(e) => { e.stopPropagation(); navigate(`/blog/${item.slug}`); }} className="flex items-center gap-1 text-xs text-slate-400 hover:text-amber-400 transition-colors">
                  Read More <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>}
      </div>
    </section>
  );
}

// ─── Price Heatmap ───────────────────────────────────────────────────────────
const HEATMAP_DATA = [
  { symbol: "BTC", change: 2.34, size: "large" },
  { symbol: "ETH", change: 1.87, size: "large" },
  { symbol: "BNB", change: -0.54, size: "medium" },
  { symbol: "SOL", change: 4.21, size: "medium" },
  { symbol: "XRP", change: -1.23, size: "medium" },
  { symbol: "DOGE", change: 3.15, size: "medium" },
  { symbol: "ADA", change: 0.87, size: "small" },
  { symbol: "TON", change: 5.43, size: "small" },
  { symbol: "TRX", change: -0.32, size: "small" },
  { symbol: "LTC", change: 1.54, size: "small" },
  { symbol: "BCH", change: 2.11, size: "small" },
  { symbol: "AVAX", change: -2.87, size: "small" },
  { symbol: "LINK", change: 1.92, size: "small" },
  { symbol: "DOT", change: -0.76, size: "small" },
  { symbol: "MATIC", change: 2.45, size: "small" },
  { symbol: "SHIB", change: 6.12, size: "small" },
];

function getHeatColor(change: number): string {
  if (change > 5) return "bg-emerald-500 text-white";
  if (change > 3) return "bg-emerald-600/80 text-white";
  if (change > 1) return "bg-emerald-700/70 text-white";
  if (change > 0) return "bg-emerald-800/60 text-emerald-200";
  if (change > -1) return "bg-red-800/60 text-red-200";
  if (change > -3) return "bg-red-700/70 text-white";
  if (change > -5) return "bg-red-600/80 text-white";
  return "bg-red-500 text-white";
}

export function PriceHeatmap() {
  const [, navigate] = useLocation();
  return (
    <section className="bg-slate-900 py-16">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-6">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-amber-400 text-sm font-semibold uppercase tracking-wider mb-1">Visual Overview</p>
            <h2 className="text-3xl font-black text-white">Market Heatmap</h2>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-emerald-500 inline-block" /> Gaining</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-500 inline-block" /> Losing</span>
          </div>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2">
          {HEATMAP_DATA.map((item, i) => (
            <motion.div
              key={item.symbol}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
              whileHover={{ scale: 1.08, zIndex: 10 }}
              onClick={() => navigate(`/trade?pair=${item.symbol}`)}
              className={`${getHeatColor(item.change)} rounded-xl p-3 cursor-pointer transition-all relative ${
                item.size === "large" ? "col-span-2 row-span-2" : ""
              }`}
            >
              <div className={`font-black ${item.size === "large" ? "text-xl" : "text-sm"}`}>{item.symbol}</div>
              <div className={`font-semibold ${item.size === "large" ? "text-base mt-1" : "text-xs"}`}>
                {item.change >= 0 ? "+" : ""}{item.change.toFixed(2)}%
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Trading Features ────────────────────────────────────────────────────────
const TRADING_FEATURES = [
  { icon: "📈", title: "Spot Trading", desc: "Buy and sell crypto at current market prices with deep liquidity.", tag: "Most Popular" },
  { icon: "📊", title: "Margin Trading", desc: "Trade with up to 10x leverage on 50+ cryptocurrency pairs.", tag: "Advanced" },
  { icon: "🔮", title: "Futures", desc: "Perpetual and quarterly futures contracts with up to 125x leverage.", tag: "Pro" },
  { icon: "🤖", title: "Copy Trading", desc: "Automatically copy trades from top-performing expert traders.", tag: "New" },
  { icon: "⚙️", title: "Options", desc: "Hedge your portfolio or speculate with crypto options contracts.", tag: "Pro" },
  { icon: "🚀", title: "Launchpad", desc: "Get early access to new token launches and IDOs.", tag: "Exclusive" },
];

export function TradingFeatures() {
  const [, navigate] = useLocation();
  return (
    <section className="bg-slate-800/40 py-16">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-6">
        <div className="text-center mb-10">
          <p className="text-amber-400 text-sm font-semibold uppercase tracking-wider mb-2">Advanced Tools</p>
          <h2 className="text-3xl font-black text-white">Trading Features</h2>
          <p className="text-slate-400 mt-2">Professional-grade tools for every type of trader</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {TRADING_FEATURES.map((feat, i) => (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -4 }}
              onClick={() => navigate("/trade")}
              className="group bg-slate-800 border border-white/8 hover:border-amber-400/20 rounded-2xl p-6 cursor-pointer transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <span className="text-3xl group-hover:scale-110 transition-transform duration-200">{feat.icon}</span>
                <span className="px-2.5 py-1 rounded-full bg-amber-400/10 text-amber-400 text-xs font-bold">{feat.tag}</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-amber-400 transition-colors">{feat.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{feat.desc}</p>
              <div className="mt-4 flex items-center gap-1 text-xs text-amber-400 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                Learn More <TrendingUp className="w-3 h-3" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Security Section ────────────────────────────────────────────────────────
const SECURITY_FEATURES = [
  { icon: Shield, title: "Cold Storage", desc: "95% of assets stored in air-gapped cold wallets, completely offline.", color: "text-emerald-400", bg: "bg-emerald-400/10" },
  { icon: Fingerprint, title: "Biometric Auth", desc: "Face ID, fingerprint, and hardware key support for maximum security.", color: "text-blue-400", bg: "bg-blue-400/10" },
  { icon: Lock, title: "256-bit Encryption", desc: "Military-grade AES-256 encryption for all data at rest and in transit.", color: "text-purple-400", bg: "bg-purple-400/10" },
  { icon: Eye, title: "24/7 Monitoring", desc: "Real-time threat detection and automated response systems.", color: "text-amber-400", bg: "bg-amber-400/10" },
  { icon: Server, title: "DDoS Protection", desc: "Enterprise-grade DDoS mitigation with 10Tbps+ capacity.", color: "text-cyan-400", bg: "bg-cyan-400/10" },
  { icon: FileCheck, title: "KYC/AML", desc: "Fully compliant identity verification and anti-money laundering checks.", color: "text-rose-400", bg: "bg-rose-400/10" },
];

export function SecuritySection() {
  const [, navigate] = useLocation();
  return (
    <section id="about" className="bg-slate-900 py-20">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-6">
        <div className="text-center mb-12">
          <p className="text-amber-400 text-sm font-semibold uppercase tracking-wider mb-2">Bank-Grade Protection</p>
          <h2 className="text-4xl font-black text-white">Security First</h2>
          <p className="text-slate-400 mt-3 max-w-xl mx-auto">Your assets are protected by the same security standards used by the world's largest financial institutions</p>
        </div>

        {/* Animated shield */}
        <div className="flex justify-center mb-12">
          <motion.div
            animate={{ scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="relative"
          >
            <div className="w-32 h-32 rounded-full bg-emerald-400/10 border-2 border-emerald-400/30 flex items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-emerald-400/20 border border-emerald-400/40 flex items-center justify-center">
                <Shield className="w-10 h-10 text-emerald-400" />
              </div>
            </div>
            {/* Orbiting dots */}
            {[0, 60, 120, 180, 240, 300].map((deg, i) => (
              <motion.div
                key={i}
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear", delay: i * 0.3 }}
                className="absolute inset-0 flex items-start justify-center"
                style={{ transformOrigin: "center center" }}
              >
                <div
                  className="w-2 h-2 rounded-full bg-emerald-400/60"
                  style={{ marginTop: -4, transform: `rotate(${deg}deg) translateY(-64px) rotate(-${deg}deg)` }}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {SECURITY_FEATURES.map((feat, i) => (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -4 }}
              className="bg-slate-800 border border-white/8 hover:border-emerald-400/20 rounded-2xl p-6 transition-all"
            >
              <div className={`w-12 h-12 ${feat.bg} rounded-xl flex items-center justify-center mb-4`}>
                <feat.icon className={`w-6 h-6 ${feat.color}`} />
              </div>
              <h3 className="font-bold text-white mb-2">{feat.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{feat.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Insurance badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-6 p-6 bg-emerald-400/5 border border-emerald-400/20 rounded-2xl"
        >
          <Shield className="w-10 h-10 text-emerald-400 shrink-0" />
          <div className="text-center sm:text-left">
            <div className="font-bold text-white text-lg">$500M Insurance Fund</div>
            <div className="text-sm text-slate-400">All user assets are insured up to $500M through our partnership with leading insurance providers</div>
          </div>
          <button onClick={() => navigate("/security")} className="shrink-0 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-sm transition-all">
            Learn More
          </button>
        </motion.div>
      </div>
    </section>
  );
}
