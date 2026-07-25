import { useState } from "react";
import PageLayout from "@/components/PageLayout";
import { Link } from "wouter";
import { TrendingUp, TrendingDown, Search, Star } from "lucide-react";
import { motion } from "framer-motion";

const MARKETS = [
  { rank: 1, name: "Gold", symbol: "XAU/USD", price: "$2,340.50", change: "+0.82%", up: true, vol: "$186B", cap: "$14.2T", category: "Gold" },
  { rank: 2, name: "Silver", symbol: "XAG/USD", price: "$29.14", change: "+1.24%", up: true, vol: "$8.2B", cap: "$1.1T", category: "Gold" },
  { rank: 3, name: "GoldVault Token", symbol: "GVT/USD", price: "$2,340.50", change: "+0.82%", up: true, vol: "$42M", cap: "$890M", category: "Gold" },
  { rank: 4, name: "PAXG", symbol: "PAXG/USD", price: "$2,338.20", change: "+0.79%", up: true, vol: "$28M", cap: "$640M", category: "Gold" },
  { rank: 5, name: "Bitcoin", symbol: "BTC/USD", price: "$67,420.00", change: "+2.34%", up: true, vol: "$28.4B", cap: "$1.32T", category: "Crypto" },
  { rank: 6, name: "Ethereum", symbol: "ETH/USD", price: "$3,520.80", change: "+1.87%", up: true, vol: "$14.2B", cap: "$422B", category: "Crypto" },
  { rank: 7, name: "Tether", symbol: "USDT/USD", price: "$1.00", change: "0.00%", up: true, vol: "$52B", cap: "$118B", category: "Crypto" },
  { rank: 8, name: "BNB", symbol: "BNB/USD", price: "$598.40", change: "+0.92%", up: true, vol: "$1.8B", cap: "$87B", category: "Crypto" },
  { rank: 9, name: "Solana", symbol: "SOL/USD", price: "$178.60", change: "+3.21%", up: true, vol: "$3.4B", cap: "$82B", category: "Crypto" },
  { rank: 10, name: "XRP", symbol: "XRP/USD", price: "$0.6240", change: "-0.45%", up: false, vol: "$1.2B", cap: "$34B", category: "Crypto" },
  { rank: 11, name: "USD Coin", symbol: "USDC/USD", price: "$1.00", change: "0.00%", up: true, vol: "$6.8B", cap: "$33B", category: "Crypto" },
  { rank: 12, name: "Cardano", symbol: "ADA/USD", price: "$0.4820", change: "-1.23%", up: false, vol: "$420M", cap: "$17B", category: "Crypto" },
  { rank: 13, name: "Avalanche", symbol: "AVAX/USD", price: "$38.70", change: "+4.12%", up: true, vol: "$680M", cap: "$16B", category: "Crypto" },
  { rank: 14, name: "Polkadot", symbol: "DOT/USD", price: "$7.82", change: "-0.88%", up: false, vol: "$280M", cap: "$11B", category: "Crypto" },
  { rank: 15, name: "Chainlink", symbol: "LINK/USD", price: "$14.20", change: "+2.67%", up: true, vol: "$520M", cap: "$8.4B", category: "Crypto" },
];

export default function Markets() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [starred, setStarred] = useState<number[]>([1, 5]);

  const filtered = MARKETS.filter(m =>
    (filter === "All" || m.category === filter) &&
    (m.name.toLowerCase().includes(search.toLowerCase()) || m.symbol.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <PageLayout
      title="Markets"
      subtitle="Live gold and cryptocurrency prices. Track XAU, GVT, BTC, ETH and 300+ assets in real time."
      badge="📊 Live Prices"
      breadcrumb="Markets"
    >
      {/* Stats Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Gold (XAU/USD)", value: "$2,340.50", change: "+0.82%", up: true },
          { label: "BTC/USD", value: "$67,420", change: "+2.34%", up: true },
          { label: "Total Market Cap", value: "$2.48T", change: "+1.2%", up: true },
          { label: "24h Volume", value: "$142B", change: "+8.4%", up: true },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className="bg-slate-800 border border-white/10 rounded-xl p-4">
            <div className="text-xs text-slate-400 mb-1">{s.label}</div>
            <div className="text-xl font-black text-white">{s.value}</div>
            <div className={`text-xs font-semibold ${s.up ? "text-emerald-400" : "text-red-400"}`}>{s.change}</div>
          </motion.div>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search markets..."
            className="w-full pl-9 pr-4 py-2.5 bg-slate-800 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 outline-none focus:border-amber-400/50" />
        </div>
        <div className="flex gap-2">
          {["All", "Gold", "Crypto"].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${filter === f ? "bg-amber-500 text-slate-900" : "bg-slate-800 border border-white/10 text-slate-400 hover:text-white"}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-800 border border-white/10 rounded-2xl overflow-hidden mb-10">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/8">
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400">#</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400">Asset</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-400">Price</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-400">24h Change</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-400 hidden md:table-cell">Volume</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-400 hidden lg:table-cell">Market Cap</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-400">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m, i) => (
                <motion.tr key={m.rank} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                  className="border-b border-white/5 hover:bg-white/3 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => setStarred(s => s.includes(m.rank) ? s.filter(x => x !== m.rank) : [...s, m.rank])}>
                        <Star className={`w-3.5 h-3.5 ${starred.includes(m.rank) ? "fill-amber-400 text-amber-400" : "text-slate-600"}`} />
                      </button>
                      <span className="text-xs text-slate-500">{m.rank}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${m.category === "Gold" ? "bg-amber-500/20 text-amber-400" : "bg-blue-500/20 text-blue-400"}`}>
                        {m.symbol.slice(0, 2)}
                      </div>
                      <div>
                        <div className="font-bold text-white text-sm">{m.name}</div>
                        <div className="text-xs text-slate-500">{m.symbol}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-white text-sm">{m.price}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={`flex items-center justify-end gap-1 text-sm font-semibold ${m.up ? "text-emerald-400" : "text-red-400"}`}>
                      {m.up ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                      {m.change}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-slate-400 hidden md:table-cell">{m.vol}</td>
                  <td className="px-4 py-3 text-right text-sm text-slate-400 hidden lg:table-cell">{m.cap}</td>
                  <td className="px-4 py-3 text-right">
                    <Link href="/buy-gold">
                      <button className="px-3 py-1.5 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/25 text-amber-400 text-xs font-bold rounded-lg transition-all">
                        {m.category === "Gold" ? "Buy" : "Trade"}
                      </button>
                    </Link>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PageLayout>
  );
}
