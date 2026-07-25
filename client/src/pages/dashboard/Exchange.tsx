/**
 * Exchange — Swap between crypto/gold assets with live rates
 */
import { useState } from "react";
import UserDashboardLayout from "@/components/UserDashboardLayout";
import { motion } from "framer-motion";
import { ArrowDownUp, RefreshCw, Clock, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const assets = [
  { symbol: "BTC", name: "Bitcoin", balance: 0.1523, price: 67320, icon: "₿", color: "from-orange-500 to-orange-600" },
  { symbol: "ETH", name: "Ethereum", balance: 1.245, price: 3452, icon: "Ξ", color: "from-purple-500 to-purple-600" },
  { symbol: "USDT", name: "Tether", balance: 5230, price: 1, icon: "$", color: "from-emerald-500 to-emerald-600" },
  { symbol: "SOL", name: "Solana", balance: 12.5, price: 165, icon: "◎", color: "from-green-500 to-green-600" },
  { symbol: "USDC", name: "USD Coin", balance: 2100, price: 1, icon: "$", color: "from-blue-500 to-blue-600" },
  { symbol: "XAU", name: "Gold", balance: 2.1, price: 2393, icon: "Au", color: "from-amber-500 to-amber-600" },
  { symbol: "GVT", name: "GoldVault Token", balance: 500, price: 4.28, icon: "GV", color: "from-amber-400 to-amber-500" },
];

const recentSwaps = [
  { from: "USDT", to: "BTC", fromAmount: "1,000", toAmount: "0.01485", time: "2 hours ago", status: "completed" },
  { from: "ETH", to: "USDT", fromAmount: "0.5", toAmount: "1,726", time: "1 day ago", status: "completed" },
  { from: "BTC", to: "XAU", fromAmount: "0.05", toAmount: "1.406", time: "3 days ago", status: "completed" },
];

export default function Exchange() {
  return (
    <UserDashboardLayout>
      <ExchangeContent />
    </UserDashboardLayout>
  );
}

function ExchangeContent() {
  const [fromAsset, setFromAsset] = useState("USDT");
  const [toAsset, setToAsset] = useState("BTC");
  const [fromAmount, setFromAmount] = useState("");
  const [isSwapping, setIsSwapping] = useState(false);

  const from = assets.find(a => a.symbol === fromAsset)!;
  const to = assets.find(a => a.symbol === toAsset)!;
  const rate = from.price / to.price;
  const toAmount = fromAmount ? (parseFloat(fromAmount) * rate).toFixed(8) : "";

  const handleSwapDirection = () => {
    setFromAsset(toAsset);
    setToAsset(fromAsset);
    setFromAmount("");
  };

  const handleExchange = () => {
    if (!fromAmount || parseFloat(fromAmount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    if (parseFloat(fromAmount) > from.balance) {
      toast.error("Insufficient balance");
      return;
    }
    setIsSwapping(true);
    setTimeout(() => {
      toast.success(`Successfully swapped ${fromAmount} ${fromAsset} → ${toAmount} ${toAsset}`);
      setIsSwapping(false);
      setFromAmount("");
    }, 1500);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-foreground">Exchange</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Instantly swap between assets at live market rates</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Swap Card */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card/50 backdrop-blur-sm border border-white/5 rounded-2xl p-6 space-y-4"
          >
            {/* From */}
            <div className="bg-white/5 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">From</span>
                <span className="text-xs text-muted-foreground">Balance: {from.balance.toLocaleString()} {fromAsset}</span>
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={fromAsset}
                  onChange={(e) => setFromAsset(e.target.value)}
                  className="bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                >
                  {assets.filter(a => a.symbol !== toAsset).map(a => (
                    <option key={a.symbol} value={a.symbol}>{a.symbol}</option>
                  ))}
                </select>
                <input
                  type="number"
                  value={fromAmount}
                  onChange={(e) => setFromAmount(e.target.value)}
                  placeholder="0.00"
                  className="flex-1 bg-transparent text-right text-lg font-semibold text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
              </div>
              <div className="flex items-center gap-2 mt-2">
                {[25, 50, 75, 100].map((pct) => (
                  <button
                    key={pct}
                    onClick={() => setFromAmount((from.balance * pct / 100).toString())}
                    className="px-2 py-0.5 text-[10px] rounded bg-white/5 text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors"
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>

            {/* Swap Direction Button */}
            <div className="flex justify-center -my-2 relative z-10">
              <button
                onClick={handleSwapDirection}
                className="w-10 h-10 rounded-full bg-amber-500 text-black flex items-center justify-center hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/25"
              >
                <ArrowDownUp className="w-4 h-4" />
              </button>
            </div>

            {/* To */}
            <div className="bg-white/5 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">To</span>
                <span className="text-xs text-muted-foreground">Balance: {to.balance.toLocaleString()} {toAsset}</span>
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={toAsset}
                  onChange={(e) => setToAsset(e.target.value)}
                  className="bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                >
                  {assets.filter(a => a.symbol !== fromAsset).map(a => (
                    <option key={a.symbol} value={a.symbol}>{a.symbol}</option>
                  ))}
                </select>
                <div className="flex-1 text-right text-lg font-semibold text-foreground">
                  {toAmount || "0.00"}
                </div>
              </div>
            </div>

            {/* Rate Info */}
            <div className="flex items-center justify-between px-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <RefreshCw className="w-3 h-3" /> Rate: 1 {fromAsset} = {rate.toFixed(8)} {toAsset}
              </span>
              <span>Fee: 0.1%</span>
            </div>

            {/* Exchange Button */}
            <button
              onClick={handleExchange}
              disabled={isSwapping || !fromAmount}
              className="w-full py-3.5 bg-amber-500 text-black font-semibold rounded-xl hover:bg-amber-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSwapping ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Processing...
                </>
              ) : (
                <>
                  <ArrowDownUp className="w-4 h-4" /> Exchange Now
                </>
              )}
            </button>
          </motion.div>
        </div>

        {/* Recent Swaps */}
        <div className="bg-card/50 backdrop-blur-sm border border-white/5 rounded-2xl p-4">
          <h3 className="text-sm font-semibold text-foreground mb-4">Recent Swaps</h3>
          <div className="space-y-3">
            {recentSwaps.map((swap, i) => (
              <div key={i} className="p-3 bg-white/5 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-foreground">{swap.from} → {swap.to}</span>
                  <span className="flex items-center gap-1 text-[10px] text-emerald-400">
                    <CheckCircle2 className="w-3 h-3" /> {swap.status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>-{swap.fromAmount} {swap.from}</span>
                  <span className="text-emerald-400">+{swap.toAmount} {swap.to}</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Clock className="w-3 h-3" /> {swap.time}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
