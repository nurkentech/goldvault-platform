/**
 * Wallets — View all wallet balances with deposit/withdraw actions
 */
import { useState } from "react";
import { Link } from "wouter";
import UserDashboardLayout from "@/components/UserDashboardLayout";
import { trpc } from "@/lib/trpc";
import { motion } from "framer-motion";
import { Eye, EyeOff, ArrowDownToLine, ArrowUpFromLine, ArrowLeftRight, Copy, QrCode, TrendingUp, TrendingDown } from "lucide-react";
import { toast } from "sonner";
import { useCurrency } from "@/lib/currency";

const CURRENCY_META: Record<string, { name: string; color: string; icon: string }> = {
  BTC: { name: "Bitcoin", color: "from-orange-500 to-orange-600", icon: "₿" },
  ETH: { name: "Ethereum", color: "from-purple-500 to-purple-600", icon: "Ξ" },
  SOL: { name: "Solana", color: "from-green-500 to-green-600", icon: "◎" },
  USDT: { name: "Tether", color: "from-emerald-500 to-emerald-600", icon: "$" },
  USDC: { name: "USD Coin", color: "from-blue-500 to-blue-600", icon: "$" },
  GVT: { name: "GoldVault Token", color: "from-amber-500 to-amber-600", icon: "GV" },
  PAXG: { name: "PAX Gold", color: "from-yellow-500 to-yellow-600", icon: "Au" },
  XAUT: { name: "Tether Gold", color: "from-yellow-600 to-amber-700", icon: "Au" },
  XAU: { name: "Gold (XAU)", color: "from-amber-400 to-amber-500", icon: "Au" },
};

export default function Wallets() {
  return (
    <UserDashboardLayout>
      <WalletsContent />
    </UserDashboardLayout>
  );
}

function WalletsContent() {
  const { formatUsd, currency } = useCurrency();
  const [hideBalances, setHideBalances] = useState(false);
  const { data: wallets, isLoading } = trpc.wallet.list.useQuery();
  const { data: marketPrices = [] } = trpc.market.prices.useQuery(undefined, {
    refetchInterval: 30_000,
  });

  const priceFor = (currency: string) => {
    const marketSymbol = ["XAU", "PAXG", "XAUT"].includes(currency)
      ? "GOLD"
      : currency;
    const match = marketPrices.find((price) => price.symbol === marketSymbol);
    return { price: match?.price ?? 0, change: match?.change24h ?? null };
  };

  const totalValue = wallets?.reduce((sum, w) => {
    const bal = parseFloat(w.balance || "0");
    const price = priceFor(w.currency).price;
    return sum + bal * price;
  }, 0) ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">My Wallets</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Manage your crypto and gold assets</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setHideBalances(!hideBalances)} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors">
            {hideBalances ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Total Balance Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20 rounded-2xl p-6"
      >
        <p className="text-sm text-muted-foreground mb-1">Total Portfolio Value</p>
        <p className="text-3xl font-bold text-foreground">
          {hideBalances ? "••••••••" : formatUsd(totalValue)}
        </p>
        <div className="flex items-center gap-4 mt-4">
          <Link href="/dashboard/deposit">
            <button className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-black rounded-xl text-sm font-semibold hover:bg-amber-400 transition-colors">
              <ArrowDownToLine className="w-4 h-4" /> Deposit
            </button>
          </Link>
          <Link href="/dashboard/withdraw">
            <button className="flex items-center gap-2 px-4 py-2 bg-white/10 text-foreground rounded-xl text-sm font-semibold hover:bg-white/15 transition-colors border border-white/10">
              <ArrowUpFromLine className="w-4 h-4" /> Withdraw
            </button>
          </Link>
          <Link href="/dashboard/exchange">
            <button className="flex items-center gap-2 px-4 py-2 bg-white/10 text-foreground rounded-xl text-sm font-semibold hover:bg-white/15 transition-colors border border-white/10">
              <ArrowLeftRight className="w-4 h-4" /> Exchange
            </button>
          </Link>
        </div>
      </motion.div>

      {/* Wallet Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-40 bg-white/5 rounded-2xl animate-pulse" />
          ))
        ) : (
          wallets?.map((wallet, i) => {
            const meta = CURRENCY_META[wallet.currency] || { name: wallet.currency, color: "from-gray-500 to-gray-600", icon: "?" };
            const priceData = priceFor(wallet.currency);
            const balance = parseFloat(wallet.balance || "0");
            const usdValue = balance * priceData.price;

            return (
              <motion.div
                key={wallet.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card/50 backdrop-blur-sm border border-white/5 rounded-2xl p-4 hover:border-amber-500/20 transition-colors group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${meta.color} flex items-center justify-center text-white font-bold text-sm`}>
                      {meta.icon}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{meta.name}</p>
                      <p className="text-xs text-muted-foreground">{wallet.currency}</p>
                    </div>
                  </div>
                  {priceData.change === null ? (
                    <span className="text-xs text-muted-foreground">Price unavailable</span>
                  ) : (
                    <div className={`flex items-center gap-1 text-xs font-medium ${priceData.change >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                      {priceData.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {priceData.change >= 0 ? "+" : ""}{priceData.change.toFixed(2)}%
                    </div>
                  )}
                </div>

                <div className="mb-3">
                  <p className="text-lg font-bold text-foreground">
                    {hideBalances ? "••••" : balance.toLocaleString("en-US", { maximumFractionDigits: 8 })}
                    <span className="text-xs text-muted-foreground ml-1">{wallet.currency}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    ≈ {hideBalances ? "••••" : formatUsd(usdValue)} {currency}
                  </p>
                </div>

                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => { toast.info("Deposit address copied!"); }}
                    className="flex items-center gap-1 px-2 py-1 text-[10px] bg-white/5 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Copy className="w-3 h-3" /> Copy Address
                  </button>
                  <button className="flex items-center gap-1 px-2 py-1 text-[10px] bg-white/5 rounded-lg text-muted-foreground hover:text-foreground transition-colors">
                    <QrCode className="w-3 h-3" /> QR Code
                  </button>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
