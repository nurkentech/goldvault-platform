import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowUpDown, ArrowRight, Zap, Shield, Globe, Users, TrendingUp, Award, RefreshCw } from "lucide-react";
import { useLocation } from "wouter";
import { openSignUpModal } from "@/pages/Home";

// ─── TradingView Chart ───────────────────────────────────────────────────────
const TV_SYMBOLS: Record<string, string> = {
  "XAU": "TVC:GOLD",
  "XAG": "TVC:SILVER",
  "GVT": "BINANCE:BTCUSDT",
  BTC: "BINANCE:BTCUSDT",
  ETH: "BINANCE:ETHUSDT",
  SOL: "BINANCE:SOLUSDT",
  XRP: "BINANCE:XRPUSDT",
};

const TIMEFRAMES = ["1m", "5m", "15m", "1H", "4H", "1D", "1W"];
const TV_INTERVAL_MAP: Record<string, string> = {
  "1m": "1", "5m": "5", "15m": "15", "1H": "60", "4H": "240", "1D": "D", "1W": "W",
};

function TradingViewChart() {
  const [coin, setCoin] = useState("BTC");
  const [tf, setTf] = useState("1H");
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptRef = useRef<HTMLScriptElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: TV_SYMBOLS[coin],
      interval: TV_INTERVAL_MAP[tf],
      timezone: "Etc/UTC",
      theme: "dark",
      style: "1",
      locale: "en",
      backgroundColor: "rgba(15, 23, 42, 1)",
      gridColor: "rgba(255, 255, 255, 0.05)",
      hide_top_toolbar: false,
      hide_legend: false,
      save_image: false,
      calendar: false,
      support_host: "https://www.tradingview.com",
    });
    containerRef.current.appendChild(script);
    scriptRef.current = script;
  }, [coin, tf]);

  return (
    <section id="trade" className="bg-slate-900 py-16">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <p className="text-amber-400 text-sm font-semibold uppercase tracking-wider mb-1">Live Charts</p>
            <h2 className="text-3xl font-black text-white">Gold &amp; Crypto Live Charts</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {/* Coin selector */}
            <div className="flex gap-1 bg-slate-800 rounded-xl p-1">
              {Object.keys(TV_SYMBOLS).map((c) => (
                <button
                  key={c}
                  onClick={() => setCoin(c)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    coin === c ? "bg-amber-500 text-slate-900" : "text-slate-400 hover:text-white"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
            {/* Timeframe selector */}
            <div className="flex gap-1 bg-slate-800 rounded-xl p-1">
              {TIMEFRAMES.map((t) => (
                <button
                  key={t}
                  onClick={() => setTf(t)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    tf === t ? "bg-amber-500 text-slate-900" : "text-slate-400 hover:text-white"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="rounded-2xl overflow-hidden border border-white/8 bg-slate-950" style={{ height: 480 }}>
          <div ref={containerRef} style={{ height: "100%", width: "100%" }} />
        </div>
      </div>
    </section>
  );
}

// ─── Crypto Converter ────────────────────────────────────────────────────────
const CURRENCIES = [
  { code: "XAU", name: "🥇 Gold (1 oz)", type: "gold" },
  { code: "XAG", name: "🥈 Silver (1 oz)", type: "gold" },
  { code: "GVT", name: "🪙 GoldVault Token", type: "gold" },
  { code: "PAXG", name: "PAX Gold", type: "gold" },
  { code: "BTC", name: "Bitcoin", type: "crypto" },
  { code: "ETH", name: "Ethereum", type: "crypto" },
  { code: "SOL", name: "Solana", type: "crypto" },
  { code: "USDT", name: "Tether", type: "crypto" },
  { code: "USD", name: "US Dollar", type: "fiat" },
  { code: "EUR", name: "Euro", type: "fiat" },
  { code: "GBP", name: "British Pound", type: "fiat" },
  { code: "NGN", name: "Nigerian Naira", type: "fiat" },
  { code: "AED", name: "UAE Dirham", type: "fiat" },
];

const RATES: Record<string, number> = {
  XAU: 2340.50, XAG: 29.84, GVT: 1.24, PAXG: 2338.20,
  BTC: 67420, ETH: 3521, SOL: 178.9, USDT: 1,
  USD: 1, EUR: 1.082, GBP: 1.267, NGN: 0.000633, AED: 0.2723,
};

function CryptoConverter() {
  const [fromCurrency, setFromCurrency] = useState("BTC");
  const [toCurrency, setToCurrency] = useState("USD");
  const [fromAmount, setFromAmount] = useState("1");
  const [loading, setLoading] = useState(false);

  const fromRate = RATES[fromCurrency] ?? 1;
  const toRate = RATES[toCurrency] ?? 1;
  const result = fromAmount ? (parseFloat(fromAmount) * fromRate / toRate).toFixed(toCurrency === "NGN" ? 0 : 6) : "0";

  const swap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const refresh = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 800);
  };

  return (
    <section id="exchange" className="bg-slate-800/40 py-16">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-6">
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-8">
            <p className="text-amber-400 text-sm font-semibold uppercase tracking-wider mb-2">Instant Conversion</p>
            <h2 className="text-3xl font-black text-white">Gold &amp; Crypto Converter</h2>
            <p className="text-slate-400 mt-2">Convert crypto to gold, gold to fiat, or any combination instantly</p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-slate-800 border border-white/10 rounded-2xl p-6 shadow-2xl"
          >
            {/* From */}
            <div className="bg-slate-900 rounded-xl p-4 mb-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-slate-400 font-medium">From</span>
                <span className="text-xs text-slate-500">Balance: 0.00</span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  value={fromAmount}
                  onChange={(e) => setFromAmount(e.target.value)}
                  className="flex-1 bg-transparent text-2xl font-black text-white outline-none placeholder-slate-600"
                  placeholder="0.00"
                  min="0"
                />
                <select
                  value={fromCurrency}
                  onChange={(e) => setFromCurrency(e.target.value)}
                  className="bg-slate-700 border border-white/10 text-white rounded-lg px-3 py-2 text-sm font-bold outline-none cursor-pointer"
                >
                  {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
                </select>
              </div>
            </div>

            {/* Swap button */}
            <div className="flex justify-center my-2">
              <button
                onClick={swap}
                className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-400/20 text-amber-400 hover:bg-amber-500/20 transition-all active:scale-90"
              >
                <ArrowUpDown className="w-4 h-4" />
              </button>
            </div>

            {/* To */}
            <div className="bg-slate-900 rounded-xl p-4 mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-slate-400 font-medium">To</span>
                <button onClick={refresh} className={`text-xs text-amber-400 flex items-center gap-1 ${loading ? "animate-spin" : ""}`}>
                  <RefreshCw className="w-3 h-3" /> Live Rate
                </button>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 text-2xl font-black text-amber-400">
                  {loading ? "..." : result}
                </div>
                <select
                  value={toCurrency}
                  onChange={(e) => setToCurrency(e.target.value)}
                  className="bg-slate-700 border border-white/10 text-white rounded-lg px-3 py-2 text-sm font-bold outline-none cursor-pointer"
                >
                  {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
                </select>
              </div>
            </div>

            <div className="text-xs text-slate-500 text-center mb-4">
              1 {fromCurrency} = {(fromRate / toRate).toFixed(6)} {toCurrency} · Updated just now
            </div>

            <button
              onClick={() => openSignUpModal("signup")}
              className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold text-base transition-all shadow-lg shadow-amber-500/25 active:scale-[0.97] flex items-center justify-center gap-2"
            >
              Convert to Gold
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ─── Featured Services ───────────────────────────────────────────────────────
const SERVICES = [
  { icon: "🥇", label: "Buy Gold with Crypto", desc: "Convert BTC, ETH, USDT to real gold instantly", color: "from-amber-500/20 to-amber-600/10", border: "border-amber-500/20", href: "/buy-gold" },
  { icon: "🪙", label: "Mint Gold Bars", desc: "1g, 10g, 1oz, 10oz physical bars", color: "from-yellow-500/20 to-yellow-600/10", border: "border-yellow-500/20", href: "/mint" },
  { icon: "🏦", label: "Gold ETF Wallet", desc: "GLD, IAU, PAXG, XAUT, GVT tokens", color: "from-orange-500/20 to-orange-600/10", border: "border-orange-500/20", href: "/gold-etf" },
  { icon: "⚡", label: "Instant Gold Swap", desc: "Crypto ↔ Gold in under 2 minutes", color: "from-purple-500/20 to-purple-600/10", border: "border-purple-500/20", href: "/exchange" },
  { icon: "🛡️", label: "Vault Storage", desc: "Insured, audited, 99.99% pure gold", color: "from-emerald-500/20 to-emerald-600/10", border: "border-emerald-500/20", href: "/vault-storage" },
  { icon: "👛", label: "Crypto Wallet", desc: "Multi-chain wallet for 300+ assets", color: "from-blue-500/20 to-blue-600/10", border: "border-blue-500/20", href: "/bitcoin-wallet" },
  { icon: "💸", label: "Gold Withdrawals", desc: "Cash out gold to bank or card", color: "from-teal-500/20 to-teal-600/10", border: "border-teal-500/20", href: "/exchange" },
  { icon: "🏅", label: "Gold Mining Partners", desc: "8 world-class mine partnerships", color: "from-rose-500/20 to-rose-600/10", border: "border-rose-500/20", href: "/mining-partners" },
  { icon: "🎮", label: "GoldCoins Rewards", desc: "Earn gold coins via challenges", color: "from-cyan-500/20 to-cyan-600/10", border: "border-cyan-500/20", href: "/goldcoins" },
];

function FeaturedServices() {
  const [, navigate] = useLocation();
  return (
    <section className="bg-slate-900 py-16">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-6">
        <div className="text-center mb-10">
          <p className="text-amber-400 text-sm font-semibold uppercase tracking-wider mb-2">Everything You Need</p>
          <h2 className="text-3xl font-black text-white">Featured Services</h2>
          <p className="text-slate-400 mt-2">One platform for all your crypto needs</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {SERVICES.map((svc, i) => (
            <motion.button
              key={svc.label}
              onClick={() => navigate(svc.href)}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              whileHover={{ y: -4, scale: 1.03 }}
              className={`flex flex-col items-center gap-3 p-5 rounded-2xl bg-gradient-to-br ${svc.color} border ${svc.border} hover:border-amber-400/30 transition-all duration-300 group text-center`}
            >
              <span className="text-3xl group-hover:scale-110 transition-transform duration-200">{svc.icon}</span>
              <div>
                <div className="text-sm font-bold text-white">{svc.label}</div>
                <div className="text-xs text-slate-400 mt-0.5 leading-tight">{svc.desc}</div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Why GoldVaults ──────────────────────────────────────────────────────────
const STATS = [
  { value: "100+", label: "Countries", icon: Globe, color: "text-blue-400" },
  { value: "5M+", label: "Users", icon: Users, color: "text-emerald-400" },
  { value: "$40B+", label: "Trading Volume", icon: TrendingUp, color: "text-amber-400" },
  { value: "99.99%", label: "Uptime", icon: Zap, color: "text-purple-400" },
];

const FEATURES = [
  { icon: Shield, title: "Physical Gold, On-Chain", desc: "Every GVT token is backed 1:1 by 99.99% pure gold held in insured, audited vaults worldwide.", color: "text-amber-400", bg: "bg-amber-400/10" },
  { icon: Zap, title: "Instant Crypto-to-Gold Swap", desc: "Convert BTC, ETH, SOL or USDT to tokenized gold or physical bars in under 2 minutes.", color: "text-yellow-400", bg: "bg-yellow-400/10" },
  { icon: Globe, title: "8 World-Class Mining Partners", desc: "Direct partnerships with Barrick, Newmont, AngloGold, Kinross and 4 more top gold producers.", color: "text-blue-400", bg: "bg-blue-400/10" },
  { icon: Award, title: "SEC & FCA Regulated", desc: "Fully licensed under SEC, FinCEN, FCA, and MiCA. Quarterly vault audits, $500M insurance.", color: "text-purple-400", bg: "bg-purple-400/10" },
];

function WhyGoldVaults() {
  return (
    <section className="bg-slate-800/40 py-20">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-6">
        <div className="text-center mb-12">
          <p className="text-amber-400 text-sm font-semibold uppercase tracking-wider mb-2">Why Choose Us</p>
          <h2 className="text-4xl font-black text-white">Why GoldVaults.us?</h2>
          <p className="text-slate-400 mt-3 max-w-xl mx-auto">The only platform where your crypto buys real, physical, vault-stored gold — regulated, insured, and always redeemable</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-14">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-slate-800 border border-white/8 rounded-2xl p-6 text-center"
            >
              <stat.icon className={`w-6 h-6 ${stat.color} mx-auto mb-3`} />
              <div className={`text-4xl font-black ${stat.color} mb-1`}>{stat.value}</div>
              <div className="text-sm text-slate-400">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map((feat, i) => (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -4 }}
              className="bg-slate-800 border border-white/8 hover:border-amber-400/20 rounded-2xl p-6 transition-all"
            >
              <div className={`w-12 h-12 ${feat.bg} rounded-xl flex items-center justify-center mb-4`}>
                <feat.icon className={`w-6 h-6 ${feat.color}`} />
              </div>
              <h3 className="font-bold text-white mb-2">{feat.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export { TradingViewChart, CryptoConverter, FeaturedServices, WhyGoldVaults };
