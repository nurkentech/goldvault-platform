/**
 * Dashboard — Premium fintech dashboard main page
 * Matches the reference design: sidebar layout, portfolio cards, quick actions,
 * charts, transactions, investments, announcements, live market, AI assistant
 */
import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import UserDashboardLayout from "@/components/UserDashboardLayout";
import { motion } from "framer-motion";
import {
  ArrowDownToLine, ArrowUpFromLine, ArrowLeftRight, TrendingUp,
  Bitcoin, CreditCard, Users, MoreHorizontal, CheckCircle2,
  Clock, Shield, Eye, EyeOff, Coins, ShoppingCart, AlertTriangle, RefreshCw
} from "lucide-react";
import { useCurrency } from "@/lib/currency";

// Animated counter component
function AnimatedCounter({ value, format }: { value: number; format: (value: number) => string }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<number>(0);

  useEffect(() => {
    const start = ref.current;
    const end = value;
    const duration = 1200;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = start + (end - start) * eased;
      setDisplay(current);
      ref.current = current;
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [value]);

  return <span>{format(display)}</span>;
}

export default function Dashboard() {
  return (
    <UserDashboardLayout>
      <DashboardContent />
    </UserDashboardLayout>
  );
}

function DashboardContent() {
  const { user } = useAuth();
  const { formatUsd } = useCurrency();
  const [hideBalances, setHideBalances] = useState(false);
  const [chartPeriod, setChartPeriod] = useState<"1W" | "1M" | "3M" | "1Y">("1M");

  // Fetch wallet data
  const walletsQuery = trpc.wallet.list.useQuery(undefined, { retry: false });
  const transactionsQuery = trpc.transaction.list.useQuery(
    { limit: 5 },
    { retry: false },
  );
  const investmentsQuery = trpc.investment.list.useQuery(undefined, { retry: false });
  const pricesQuery = trpc.market.prices.useQuery(undefined, {
    refetchInterval: 30_000,
    retry: false,
  });
  const wallets = walletsQuery.data;
  const transactions = transactionsQuery.data;
  const investments = investmentsQuery.data ?? [];
  const marketPrices = pricesQuery.data ?? [];
  const accountDataLoading =
    walletsQuery.isLoading ||
    transactionsQuery.isLoading ||
    investmentsQuery.isLoading;
  const accountDataError =
    walletsQuery.isError ||
    transactionsQuery.isError ||
    investmentsQuery.isError;
  const [loadingTimedOut, setLoadingTimedOut] = useState(false);
  const [loadingAttempt, setLoadingAttempt] = useState(0);

  useEffect(() => {
    if (!accountDataLoading) {
      setLoadingTimedOut(false);
      return;
    }

    const timeout = window.setTimeout(() => setLoadingTimedOut(true), 12_000);
    return () => window.clearTimeout(timeout);
  }, [accountDataLoading, loadingAttempt]);

  const priceFor = (currency: string) => {
    if (currency === "USD") return 1;
    const symbol = ["XAU", "PAXG", "XAUT"].includes(currency)
      ? "GOLD"
      : currency;
    return marketPrices.find((price) => price.symbol === symbol)?.price ?? 0;
  };

  // Every displayed balance is derived from persisted wallets/investments.
  const availableBalance =
    wallets?.reduce(
      (sum, wallet) => sum + Number(wallet.balance || 0) * priceFor(wallet.currency),
      0,
    ) ?? 0;
  const activeInvestmentRows = investments.filter(
    (investment) => investment.status === "active",
  );
  const lockedBalance = activeInvestmentRows.reduce(
    (sum, investment) =>
      sum + Number(investment.amount || 0) * priceFor(investment.currency),
    0,
  );
  const totalProfit = investments.reduce(
    (sum, investment) =>
      sum + Number(investment.earnedProfit || 0) * priceFor(investment.currency),
    0,
  );
  const totalPortfolio = availableBalance + lockedBalance;
  const activeInvestments = activeInvestmentRows.length;
  const allocationAssets =
    wallets
      ?.map((wallet) => ({
        label: wallet.currency,
        value: Number(wallet.balance || 0) * priceFor(wallet.currency),
      }))
      .filter((asset) => asset.value > 0) ?? [];

  if (accountDataLoading && !loadingTimedOut) {
    return <DashboardDataSkeleton />;
  }

  const retryDashboardData = () => {
    setLoadingTimedOut(false);
    setLoadingAttempt((attempt) => attempt + 1);
    void Promise.all([
      walletsQuery.refetch(),
      transactionsQuery.refetch(),
      investmentsQuery.refetch(),
      pricesQuery.refetch(),
    ]);
  };

  const quickActions = [
    { label: "Deposit", icon: ArrowDownToLine, path: "/dashboard/deposit", color: "from-emerald-500 to-emerald-600" },
    { label: "Withdraw", icon: ArrowUpFromLine, path: "/dashboard/withdraw", color: "from-blue-500 to-blue-600" },
    { label: "Transfer", icon: ArrowLeftRight, path: "/dashboard/exchange", color: "from-purple-500 to-purple-600" },
    { label: "Exchange", icon: ArrowLeftRight, path: "/dashboard/exchange", color: "from-cyan-500 to-cyan-600" },
    { label: "Invest", icon: TrendingUp, path: "/dashboard/investments", color: "from-amber-500 to-amber-600" },
    { label: "Buy Crypto", icon: Bitcoin, path: "/dashboard/crypto-market", color: "from-orange-500 to-orange-600" },
    { label: "Pay Bills", icon: CreditCard, path: "/dashboard/cards", color: "from-pink-500 to-pink-600" },
    { label: "Refer Friends", icon: Users, path: "/dashboard/referral", color: "from-indigo-500 to-indigo-600" },
    { label: "More", icon: MoreHorizontal, path: "/dashboard/wallets", color: "from-gray-500 to-gray-600" },
  ];

  return (
    <div className="space-y-6">
      {(accountDataError || loadingTimedOut || pricesQuery.isError) && (
        <div
          role="status"
          className="flex flex-col gap-3 rounded-2xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
            <div>
              <p className="font-medium text-foreground">
                {accountDataError || loadingTimedOut
                  ? "Some account data could not be loaded."
                  : "Live market prices are temporarily unavailable."}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                The dashboard remains available. Retry to refresh the missing information.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={retryDashboardData}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-amber-500/30 px-3 py-2 text-xs font-semibold text-amber-400 transition-colors hover:bg-amber-500/10"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Retry
          </button>
        </div>
      )}

      {/* Welcome Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Welcome back,</p>
          <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "'DM Sans', sans-serif" }}>{user?.name || "User"} 👋</h1>
          <p className="text-xs text-muted-foreground mt-1">Here's what's happening with your account today.</p>
        </div>

        {/* Status Badges */}
        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge label="Profile Completion" value="100%" icon={<CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />} />
          <StatusBadge label="KYC Status" value="Verified" icon={<Shield className="w-3.5 h-3.5 text-emerald-400" />} />
          <StatusBadge label="Security Score" value="95/100" icon={<Shield className="w-3.5 h-3.5 text-amber-400" />} />
          <StatusBadge label="Last Login" value={new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })} icon={<Clock className="w-3.5 h-3.5 text-blue-400" />} />
        </div>
      </div>

      {/* Portfolio Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <PortfolioCard
          title="Total Portfolio Value"
          value={hideBalances ? "••••••" : <AnimatedCounter value={totalPortfolio} format={formatUsd} />}
          subtitle={<span className="text-muted-foreground">Wallets plus active investments</span>}
          icon={<div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/20 flex items-center justify-center"><TrendingUp className="w-5 h-5 text-amber-500" /></div>}
          toggleHide={() => setHideBalances(!hideBalances)}
          hideBalances={hideBalances}
        />
        <PortfolioCard
          title="Available Balance"
          value={hideBalances ? "••••••" : <AnimatedCounter value={availableBalance} format={formatUsd} />}
          icon={<div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center"><ArrowDownToLine className="w-4 h-4 text-emerald-400" /></div>}
        />
        <PortfolioCard
          title="Locked Balance"
          value={hideBalances ? "••••••" : <AnimatedCounter value={lockedBalance} format={formatUsd} />}
          icon={<div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center"><Shield className="w-4 h-4 text-blue-400" /></div>}
        />
        <PortfolioCard
          title="Total Profit"
          value={hideBalances ? "••••••" : <AnimatedCounter value={totalProfit} format={formatUsd} />}
          subtitle={<span className="text-emerald-400">+12.4%</span>}
          icon={<div className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center"><TrendingUp className="w-4 h-4 text-purple-400" /></div>}
        />
        <PortfolioCard
          title="Active Investments"
          value={<span className="text-2xl font-bold">{activeInvestments}</span>}
          subtitle="Running Plans"
          icon={<div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center"><CreditCard className="w-4 h-4 text-amber-400" /></div>}
        />
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-card/50 backdrop-blur-sm border border-white/5 rounded-2xl p-5"
      >
        <h3 className="text-sm font-semibold text-foreground mb-4">Quick Actions</h3>
        <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.label} href={action.path}>
                <div className="flex flex-col items-center gap-2 group cursor-pointer">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${action.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-[11px] text-muted-foreground group-hover:text-foreground transition-colors text-center">{action.label}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </motion.div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Portfolio Growth Chart */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-3 bg-card/50 backdrop-blur-sm border border-white/5 rounded-2xl p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Portfolio Growth</h3>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xl font-bold text-foreground">{formatUsd(totalPortfolio)}</span>
                <span className="text-xs text-muted-foreground font-medium">Live database balance</span>
              </div>
            </div>
            <div className="flex items-center gap-1 bg-white/5 rounded-lg p-0.5">
              {(["1W", "1M", "3M", "1Y"] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setChartPeriod(period)}
                  className={`px-3 py-1 text-xs rounded-md transition-all ${chartPeriod === period ? "bg-amber-500 text-black font-semibold" : "text-muted-foreground hover:text-foreground"}`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>
          <div className="h-44 flex items-center justify-center rounded-xl border border-dashed border-white/10 text-sm text-muted-foreground">
            Historical performance will appear after portfolio snapshots are recorded.
          </div>
        </motion.div>

        {/* Asset Allocation */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="lg:col-span-2 bg-card/50 backdrop-blur-sm border border-white/5 rounded-2xl p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">Asset Allocation</h3>
            <Link href="/dashboard/wallets">
              <span className="text-xs text-amber-500 hover:text-amber-400 cursor-pointer">View All</span>
            </Link>
          </div>
            <AssetAllocationChart assets={allocationAssets} />
        </motion.div>
      </div>

      {/* Bottom Row: Transactions + Investments + Right Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Transactions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card/50 backdrop-blur-sm border border-white/5 rounded-2xl p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">Recent Transactions</h3>
            <Link href="/dashboard/transactions">
              <span className="text-xs text-amber-500 hover:text-amber-400 cursor-pointer">View All</span>
            </Link>
          </div>
          <TransactionsList items={transactions ?? []} />
        </motion.div>

        {/* My Investments */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="bg-card/50 backdrop-blur-sm border border-white/5 rounded-2xl p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">My Investments</h3>
            <Link href="/dashboard/investments">
              <span className="text-xs text-amber-500 hover:text-amber-400 cursor-pointer">View All</span>
            </Link>
          </div>
          <InvestmentsList items={investments} />
        </motion.div>

        {/* Right Column: Announcements + Live Market */}
        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-card/50 backdrop-blur-sm border border-white/5 rounded-2xl p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-foreground">Latest Announcements</h3>
              <span className="text-xs text-amber-500 cursor-pointer">View All</span>
            </div>
            <AnnouncementsList />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="bg-card/50 backdrop-blur-sm border border-white/5 rounded-2xl p-5"
          >
            <LiveMarketWidget />
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// --- Sub-components ---

function DashboardDataSkeleton() {
  return (
    <div className="space-y-6 animate-pulse" aria-label="Loading dashboard data">
      <div className="h-16 rounded-2xl bg-white/5" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, index) => <div key={index} className="h-28 rounded-2xl bg-white/5" />)}
      </div>
      <div className="h-28 rounded-2xl bg-white/5" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="h-64 rounded-2xl bg-white/5" />
        <div className="h-64 rounded-2xl bg-white/5" />
      </div>
    </div>
  );
}

function StatusBadge({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 bg-white/5 border border-white/5 rounded-xl px-3 py-2">
      {icon}
      <div>
        <p className="text-[10px] text-muted-foreground">{label}</p>
        <p className="text-xs font-semibold text-foreground">{value}</p>
      </div>
    </div>
  );
}

function PortfolioCard({ title, value, subtitle, icon, toggleHide, hideBalances }: {
  title: string;
  value: React.ReactNode;
  subtitle?: React.ReactNode;
  icon: React.ReactNode;
  toggleHide?: () => void;
  hideBalances?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-card/50 backdrop-blur-sm border border-white/5 rounded-2xl p-4"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <p className="text-xs text-muted-foreground">{title}</p>
          {toggleHide && (
            <button onClick={toggleHide} className="text-muted-foreground hover:text-foreground">
              {hideBalances ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
            </button>
          )}
        </div>
        {icon}
      </div>
      <div className="text-xl font-bold text-foreground">{value}</div>
      {subtitle && <p className="text-xs mt-1">{subtitle}</p>}
    </motion.div>
  );
}

function AssetAllocationChart({ assets }: { assets: Array<{ label: string; value: number }> }) {
  const colors = ["#22c55e", "#f59e0b", "#6366f1", "#ec4899", "#64748b", "#06b6d4"];
  const total = assets.reduce((sum, asset) => sum + asset.value, 0);
  const allocation = assets.map((asset, index) => ({
    ...asset,
    pct: total > 0 ? (asset.value / total) * 100 : 0,
    color: colors[index % colors.length],
  }));
  let cumulativeAngle = 0;
  const radius = 60;
  const cx = 80;
  const cy = 80;
  const strokeWidth = 20;

  if (allocation.length === 0) {
    return <div className="h-32 flex items-center justify-center text-sm text-muted-foreground">No funded wallets yet.</div>;
  }

  return (
    <div className="flex items-center gap-4">
      <svg viewBox="0 0 160 160" className="w-32 h-32 shrink-0">
        {allocation.map((asset) => {
          const startAngle = cumulativeAngle;
          const sweepAngle = (asset.pct / 100) * 360;
          cumulativeAngle += sweepAngle;

          const startRad = ((startAngle - 90) * Math.PI) / 180;
          const endRad = ((startAngle + sweepAngle - 90) * Math.PI) / 180;

          const x1 = cx + radius * Math.cos(startRad);
          const y1 = cy + radius * Math.sin(startRad);
          const x2 = cx + radius * Math.cos(endRad);
          const y2 = cy + radius * Math.sin(endRad);

          const largeArc = sweepAngle > 180 ? 1 : 0;

          return (
            <path
              key={asset.label}
              d={`M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`}
              fill="none"
              stroke={asset.color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
          );
        })}
      </svg>
      <div className="space-y-2">
        {allocation.map((asset) => (
          <div key={asset.label} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: asset.color }} />
            <span className="text-xs text-muted-foreground">{asset.label}</span>
            <span className="text-xs font-semibold text-foreground ml-auto">{asset.pct.toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TransactionsList({
  items,
}: {
  items: Array<{
    id: number;
    type: string;
    currency: string;
    amount: string;
    status: string;
    createdAt: Date;
  }>;
}) {
  if (items.length === 0) {
    return <p className="py-8 text-center text-xs text-muted-foreground">No transactions yet.</p>;
  }
  return (
    <div className="space-y-3">
      {items.map((tx) => {
        const positive = ["deposit", "receive"].includes(tx.type);
        return (
        <div key={tx.id} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${positive ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
            {tx.type[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-foreground truncate">{tx.type.replaceAll("_", " ")} · {tx.currency}</p>
            <p className="text-[10px] text-muted-foreground">{new Date(tx.createdAt).toLocaleDateString()}</p>
          </div>
          <div className="text-right">
            <p className={`text-xs font-semibold ${positive ? "text-emerald-400" : "text-foreground"}`}>{positive ? "+" : "-"}{Number(tx.amount).toLocaleString()} {tx.currency}</p>
            <p className={`text-[10px] ${tx.status === "confirmed" ? "text-emerald-400" : "text-amber-400"}`}>{tx.status}</p>
          </div>
        </div>
      )})}
    </div>
  );
}

function InvestmentsList({
  items,
}: {
  items: Array<{
    id: number;
    planName: string;
    status: string;
    amount: string;
    currency: string;
    expectedRoi: string;
    startDate: Date;
    endDate: Date;
  }>;
}) {
  return (
    <div className="space-y-4">
      {items.length === 0 && (
        <p className="py-6 text-center text-xs text-muted-foreground">No investments yet.</p>
      )}
      {items.slice(0, 3).map((inv) => {
        const start = new Date(inv.startDate).getTime();
        const end = new Date(inv.endDate).getTime();
        const progress = Math.max(0, Math.min(100, ((Date.now() - start) / Math.max(1, end - start)) * 100));
        return (
        <div key={inv.id} className="bg-white/5 rounded-xl p-3 border border-white/5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-foreground">{inv.planName}</p>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full font-medium">{inv.status}</span>
          </div>
          <div className="grid grid-cols-3 gap-2 mb-2">
            <div>
              <p className="text-[10px] text-muted-foreground">Invested</p>
              <p className="text-xs font-semibold text-foreground">{Number(inv.amount).toLocaleString()} {inv.currency}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">ROI</p>
              <p className="text-xs font-semibold text-emerald-400">{inv.expectedRoi}%</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Next Payout</p>
              <p className="text-xs font-semibold text-foreground">{new Date(inv.endDate).toLocaleDateString()}</p>
            </div>
          </div>
          <div className="w-full bg-white/10 rounded-full h-1.5">
            <div className="bg-gradient-to-r from-amber-500 to-emerald-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-[10px] text-muted-foreground mt-1 text-right">{progress.toFixed(0)}%</p>
        </div>
      )})}
      <Link href="/dashboard/investments">
        <button className="w-full text-xs text-amber-500 hover:text-amber-400 font-medium py-2 border border-amber-500/20 rounded-xl hover:bg-amber-500/5 transition-colors">
          Create New Investment →
        </button>
      </Link>
    </div>
  );
}

function AnnouncementsList() {
  const announcements = [
    { icon: "🔧", title: "System Maintenance", desc: "Jul 10, 2026 12:00 – 2:00 AM UTC", color: "text-blue-400" },
    { icon: "📈", title: "New Investment Plan", desc: "Earn up to 20% ROI on our new plan", color: "text-emerald-400" },
    { icon: "🎁", title: "USDT Deposit Bonus", desc: "Get 3% bonus on USDT deposits", color: "text-amber-400" },
  ];

  return (
    <div className="space-y-3">
      {announcements.map((a, i) => (
        <div key={i} className="flex items-start gap-3 py-2 border-b border-white/5 last:border-0">
          <span className="text-lg">{a.icon}</span>
          <div>
            <p className="text-xs font-semibold text-foreground">{a.title}</p>
            <p className={`text-[10px] ${a.color}`}>{a.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function LiveMarketWidget() {
  const [tab, setTab] = useState<"Crypto" | "Gold" | "Forex">("Crypto");
  const { data: prices = [] } = trpc.market.prices.useQuery(undefined, {
    refetchInterval: 30_000,
  });
  const visiblePrices = prices.filter((price) => {
    if (tab === "Gold") return price.symbol === "GOLD";
    if (tab === "Forex") return false;
    return price.symbol !== "GOLD";
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-foreground">Live Market</h3>
        <div className="flex items-center gap-1 bg-white/5 rounded-lg p-0.5">
          {(["Crypto", "Gold", "Forex"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-2.5 py-1 text-[10px] rounded-md transition-all ${tab === t ? "bg-amber-500 text-black font-semibold" : "text-muted-foreground hover:text-foreground"}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <div className="grid grid-cols-3 text-[10px] text-muted-foreground pb-1 border-b border-white/5">
          <span>Pair</span>
          <span className="text-right">Price</span>
          <span className="text-right">24h Change</span>
        </div>
        {visiblePrices.length === 0 && (
          <p className="py-4 text-center text-xs text-muted-foreground">No live prices available for this market.</p>
        )}
        {visiblePrices.map((price) => (
          <div key={price.symbol} className="grid grid-cols-3 items-center py-1.5">
            <span className="text-xs font-medium text-foreground">{price.symbol}/USD</span>
            <span className="text-xs text-foreground text-right">${price.price.toLocaleString("en-US", { maximumFractionDigits: 2 })}</span>
            <span className={`text-xs text-right font-medium ${(price.change24h ?? 0) >= 0 ? "text-emerald-400" : "text-red-400"}`}>
              {price.change24h === null ? "n/a" : `${price.change24h >= 0 ? "+" : ""}${price.change24h.toFixed(2)}%`}
            </span>
          </div>
        ))}
      </div>
      <Link href="/dashboard/crypto-market">
        <button className="w-full text-xs text-amber-500 hover:text-amber-400 font-medium py-2 mt-2 text-center">
          View All Markets →
        </button>
      </Link>
    </div>
  );
}
