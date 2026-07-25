import { useState, useEffect } from "react";
import { Link, useSearch } from "wouter";
import { ArrowLeft, TrendingUp, TrendingDown, RefreshCw, ChevronDown } from "lucide-react";

const PAIRS = [
  { pair: "XAU/USD", price: "2,340.50", change: "+0.82%", vol: "$186B", up: true, icon: "🥇" },
  { pair: "GVT/USD", price: "23.40", change: "+5.12%", vol: "$42M", up: true, icon: "🏅" },
  { pair: "BTC/USD", price: "67,420", change: "+2.34%", vol: "$28.4B", up: true, icon: "₿" },
  { pair: "ETH/USD", price: "3,890", change: "+1.67%", vol: "$14.2B", up: true, icon: "Ξ" },
  { pair: "XAG/USD", price: "29.14", change: "+1.24%", vol: "$8.2B", up: true, icon: "🥈" },
  { pair: "PAXG/USD", price: "2,338.00", change: "+0.79%", vol: "$640M", up: true, icon: "🔶" },
  { pair: "SOL/USD", price: "178.40", change: "-0.43%", vol: "$6.1B", up: false, icon: "◎" },
  { pair: "BNB/USD", price: "612.30", change: "+0.91%", vol: "$3.8B", up: true, icon: "🔸" },
];

const ORDER_BOOK_ASKS = [
  { price: "2,341.20", size: "12.40", total: "29,031" },
  { price: "2,341.00", size: "8.20", total: "19,196" },
  { price: "2,340.80", size: "15.60", total: "36,517" },
  { price: "2,340.60", size: "22.10", total: "51,728" },
  { price: "2,340.55", size: "6.80", total: "15,916" },
];
const ORDER_BOOK_BIDS = [
  { price: "2,340.50", size: "18.30", total: "42,831" },
  { price: "2,340.30", size: "11.70", total: "27,382" },
  { price: "2,340.10", size: "9.40", total: "21,997" },
  { price: "2,339.90", size: "25.60", total: "59,901" },
  { price: "2,339.70", size: "14.20", total: "33,224" },
];

const RECENT_TRADES = [
  { time: "11:52:14", price: "2,340.50", size: "0.42", side: "buy" },
  { time: "11:52:11", price: "2,340.30", size: "1.20", side: "sell" },
  { time: "11:52:08", price: "2,340.50", size: "0.85", side: "buy" },
  { time: "11:52:05", price: "2,340.60", size: "2.10", side: "buy" },
  { time: "11:52:01", price: "2,340.20", size: "0.33", side: "sell" },
  { time: "11:51:58", price: "2,340.40", size: "1.75", side: "buy" },
  { time: "11:51:55", price: "2,340.10", size: "0.60", side: "sell" },
  { time: "11:51:52", price: "2,340.50", size: "3.20", side: "buy" },
];

export default function Trade() {
  const search = useSearch();
  const [selectedPair, setSelectedPair] = useState(() => {
    const params = new URLSearchParams(search);
    const pairSymbol = params.get("pair")?.toUpperCase();
    if (pairSymbol) {
      const found = PAIRS.find(p => p.pair.startsWith(pairSymbol));
      if (found) return found;
    }
    return PAIRS[0];
  });

  // Sync TradingView symbol when selectedPair changes on mount
  useEffect(() => {
    const symbolMap: Record<string, string> = {
      "XAU/USD": "XAUUSD",
      "GVT/USD": "XAUUSD",
      "BTC/USD": "BTCUSDT",
      "ETH/USD": "ETHUSDT",
      "XAG/USD": "XAGUSD",
      "PAXG/USD": "PAXGUSDT",
      "SOL/USD": "SOLUSDT",
      "BNB/USD": "BNBUSDT",
    };
    setTvSymbol(symbolMap[selectedPair.pair] ?? "XAUUSD");
  }, [selectedPair]);
  const [orderType, setOrderType] = useState<"market" | "limit" | "stop">("market");
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [amount, setAmount] = useState("1.00");
  const [limitPrice, setLimitPrice] = useState("2340.50");
  const [tvSymbol, setTvSymbol] = useState("XAUUSD");

  const handlePairSelect = (p: typeof PAIRS[0]) => {
    setSelectedPair(p);
    const symbolMap: Record<string, string> = {
      "XAU/USD": "XAUUSD",
      "GVT/USD": "XAUUSD",
      "BTC/USD": "BTCUSDT",
      "ETH/USD": "ETHUSDT",
      "XAG/USD": "XAGUSD",
      "PAXG/USD": "PAXGUSDT",
      "SOL/USD": "SOLUSDT",
      "BNB/USD": "BNBUSDT",
    };
    setTvSymbol(symbolMap[p.pair] ?? "XAUUSD");
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Top bar */}
      <div className="flex items-center gap-4 px-4 py-3 bg-slate-900 border-b border-white/8 shrink-0">
        <Link href="/" className="flex items-center gap-1.5 text-slate-400 hover:text-amber-400 transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Home</span>
        </Link>
        <div className="w-px h-5 bg-white/10" />
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-900 font-black text-xs">GV</div>
          <span className="font-black text-white text-sm hidden sm:inline">GoldVaults</span>
          <span className="text-slate-500 text-sm hidden sm:inline">/</span>
          <span className="text-amber-400 font-bold text-sm">Trade</span>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <span className="text-xs text-slate-400 hidden md:inline">Balance: <span className="text-white font-bold">$34,782.00</span></span>
          <button className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold text-xs transition-all active:scale-[0.97]">Deposit</button>
        </div>
      </div>

      {/* Pair selector strip */}
      <div className="flex items-center gap-1 px-4 py-2 bg-slate-900/80 border-b border-white/5 overflow-x-auto shrink-0 scrollbar-none">
        {PAIRS.map(p => (
          <button
            key={p.pair}
            onClick={() => handlePairSelect(p)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${selectedPair.pair === p.pair ? "bg-amber-500/15 border border-amber-400/30 text-amber-400" : "text-slate-400 hover:text-white hover:bg-slate-800"}`}
          >
            <span>{p.icon}</span>
            <span>{p.pair}</span>
            <span className={p.up ? "text-emerald-400" : "text-red-400"}>{p.change}</span>
          </button>
        ))}
      </div>

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden min-h-0">
        {/* Left: Chart */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Pair header */}
          <div className="flex items-center gap-4 px-4 py-3 bg-slate-900/50 border-b border-white/5 shrink-0">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl">{selectedPair.icon}</span>
                <span className="font-black text-white text-lg">{selectedPair.pair}</span>
              </div>
              <div className="flex items-center gap-3 mt-0.5">
                <span className="text-2xl font-black text-white">${selectedPair.price}</span>
                <span className={`flex items-center gap-1 text-sm font-bold ${selectedPair.up ? "text-emerald-400" : "text-red-400"}`}>
                  {selectedPair.up ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {selectedPair.change}
                </span>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-6 ml-4 text-xs text-slate-400">
              <div><div className="text-slate-500">24h High</div><div className="text-white font-semibold">${(parseFloat(selectedPair.price.replace(/,/g, "")) * 1.012).toFixed(2)}</div></div>
              <div><div className="text-slate-500">24h Low</div><div className="text-white font-semibold">${(parseFloat(selectedPair.price.replace(/,/g, "")) * 0.988).toFixed(2)}</div></div>
              <div><div className="text-slate-500">24h Volume</div><div className="text-white font-semibold">{selectedPair.vol}</div></div>
            </div>
          </div>

          {/* TradingView Chart */}
          <div className="flex-1 min-h-0">
            <iframe
              key={tvSymbol}
              src={`https://s.tradingview.com/widgetembed/?frameElementId=tv_chart&symbol=${tvSymbol}&interval=60&hidesidetoolbar=0&hidetoptoolbar=0&symboledit=1&saveimage=1&toolbarbg=0f172a&studies=[]&theme=dark&style=1&timezone=Etc%2FUTC&withdateranges=1&showpopupbutton=1&locale=en`}
              style={{ width: "100%", height: "100%", border: "none" }}
              title="GoldVaults Live Chart"
              allowFullScreen
            />
          </div>
        </div>

        {/* Right panel */}
        <div className="w-72 xl:w-80 flex flex-col border-l border-white/8 bg-slate-900 shrink-0 overflow-y-auto">
          {/* Order entry */}
          <div className="p-4 border-b border-white/8">
            <div className="flex gap-1 mb-4 p-1 bg-slate-800 rounded-xl">
              {(["buy", "sell"] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setSide(s)}
                  className={`flex-1 py-2 rounded-lg font-bold text-sm capitalize transition-all ${side === s ? (s === "buy" ? "bg-emerald-500 text-white" : "bg-red-500 text-white") : "text-slate-400 hover:text-white"}`}
                >
                  {s}
                </button>
              ))}
            </div>

            <div className="flex gap-1 mb-4">
              {(["market", "limit", "stop"] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setOrderType(t)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${orderType === t ? "bg-slate-700 text-white" : "text-slate-500 hover:text-slate-300"}`}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {orderType !== "market" && (
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Price (USD)</label>
                  <input
                    type="number"
                    value={limitPrice}
                    onChange={e => setLimitPrice(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-800 border border-white/8 rounded-xl text-white text-sm outline-none focus:border-amber-400/50 transition-colors"
                  />
                </div>
              )}
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Amount ({selectedPair.pair.split("/")[0]})</label>
                <input
                  type="number"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-800 border border-white/8 rounded-xl text-white text-sm outline-none focus:border-amber-400/50 transition-colors"
                />
                <div className="flex gap-1 mt-2">
                  {["25%", "50%", "75%", "100%"].map(pct => (
                    <button key={pct} className="flex-1 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs transition-all">{pct}</button>
                  ))}
                </div>
              </div>
              <div className="bg-slate-800/50 rounded-xl p-3 text-xs space-y-1.5">
                <div className="flex justify-between text-slate-400">
                  <span>Est. Total</span>
                  <span className="text-white font-semibold">${(parseFloat(amount || "0") * parseFloat(selectedPair.price.replace(/,/g, ""))).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Fee (0.1%)</span>
                  <span className="text-white">${(parseFloat(amount || "0") * parseFloat(selectedPair.price.replace(/,/g, "")) * 0.001).toFixed(2)}</span>
                </div>
              </div>
              <button
                className={`w-full py-3 rounded-xl font-bold text-sm transition-all active:scale-[0.97] ${side === "buy" ? "bg-emerald-500 hover:bg-emerald-400 text-white" : "bg-red-500 hover:bg-red-400 text-white"}`}
              >
                {side === "buy" ? "Buy" : "Sell"} {selectedPair.pair.split("/")[0]}
              </button>
            </div>
          </div>

          {/* Order book */}
          <div className="p-4 border-b border-white/8">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Order Book</h3>
              <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            </div>
            <div className="text-[10px] text-slate-500 grid grid-cols-3 mb-1.5 px-1">
              <span>Price (USD)</span><span className="text-center">Size</span><span className="text-right">Total</span>
            </div>
            {ORDER_BOOK_ASKS.map((row, i) => (
              <div key={i} className="grid grid-cols-3 text-[11px] py-0.5 px-1 hover:bg-red-500/5 rounded relative">
                <div className="absolute inset-0 right-auto bg-red-500/8 rounded" style={{ width: `${20 + i * 12}%` }} />
                <span className="text-red-400 font-mono relative z-10">{row.price}</span>
                <span className="text-center text-slate-300 relative z-10">{row.size}</span>
                <span className="text-right text-slate-400 relative z-10">{row.total}</span>
              </div>
            ))}
            <div className="text-center py-2 text-sm font-black text-white border-y border-white/5 my-1">
              ${selectedPair.price} <span className={`text-xs ${selectedPair.up ? "text-emerald-400" : "text-red-400"}`}>{selectedPair.change}</span>
            </div>
            {ORDER_BOOK_BIDS.map((row, i) => (
              <div key={i} className="grid grid-cols-3 text-[11px] py-0.5 px-1 hover:bg-emerald-500/5 rounded relative">
                <div className="absolute inset-0 right-auto bg-emerald-500/8 rounded" style={{ width: `${20 + i * 12}%` }} />
                <span className="text-emerald-400 font-mono relative z-10">{row.price}</span>
                <span className="text-center text-slate-300 relative z-10">{row.size}</span>
                <span className="text-right text-slate-400 relative z-10">{row.total}</span>
              </div>
            ))}
          </div>

          {/* Recent trades */}
          <div className="p-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Recent Trades</h3>
            <div className="text-[10px] text-slate-500 grid grid-cols-3 mb-1.5 px-1">
              <span>Time</span><span className="text-center">Price</span><span className="text-right">Size</span>
            </div>
            {RECENT_TRADES.map((t, i) => (
              <div key={i} className="grid grid-cols-3 text-[11px] py-0.5 px-1">
                <span className="text-slate-500 font-mono">{t.time}</span>
                <span className={`text-center font-mono ${t.side === "buy" ? "text-emerald-400" : "text-red-400"}`}>{t.price}</span>
                <span className="text-right text-slate-300">{t.size}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
