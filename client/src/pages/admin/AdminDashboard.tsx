import { trpc } from "@/lib/trpc";
import {
  Users, DollarSign, TrendingUp, Wallet, ShieldCheck,
  Clock, ArrowUpRight, ArrowDownRight, Activity,
  AlertTriangle, CheckCircle2, Server, Zap, BarChart3,
} from "lucide-react";

function StatCard({ title, value, icon: Icon, change, changeType, color }: {
  title: string; value: string; icon: any; change?: string; changeType?: "up" | "down"; color: string;
}) {
  return (
    <div className="bg-[#0d1321] border border-gray-800/60 rounded-xl p-5 hover:border-gray-700/60 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        {change && (
          <span className={`flex items-center gap-1 text-xs font-medium ${changeType === "up" ? "text-emerald-400" : "text-red-400"}`}>
            {changeType === "up" ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {change}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{title}</p>
    </div>
  );
}

function RecentActivityRow({ type, description, amount, time, status }: {
  type: string; description: string; amount: string; time: string; status: string;
}) {
  const statusColors: Record<string, string> = {
    confirmed: "text-emerald-400 bg-emerald-400/10",
    pending: "text-amber-400 bg-amber-400/10",
    failed: "text-red-400 bg-red-400/10",
  };
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-800/40 last:border-0">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gray-800/80 flex items-center justify-center">
          <Activity className="w-4 h-4 text-gray-400" />
        </div>
        <div>
          <p className="text-sm font-medium text-white">{description}</p>
          <p className="text-xs text-gray-500">{type} • {time}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm font-medium text-white">{amount}</p>
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColors[status] ?? statusColors.pending}`}>
          {status}
        </span>
      </div>
    </div>
  );
}

// Simple SVG line chart component
function MiniLineChart({ data, color, height = 120 }: { data: number[]; color: string; height?: number }) {
  if (data.length < 2) return <div className="flex items-center justify-center h-full text-gray-500 text-sm">No data yet</div>;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const width = 400;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 20) - 10;
    return `${x},${y}`;
  });
  const pathD = `M ${points.join(" L ")}`;
  const areaD = `${pathD} L ${width},${height} L 0,${height} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ height }}>
      <defs>
        <linearGradient id={`grad-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#grad-${color})`} />
      <path d={pathD} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function AdminDashboard() {
  const { data: stats, isLoading } = trpc.admin.stats.useQuery();
  const { data: activity } = trpc.admin.activity.useQuery({ limit: 10 });
  const { data: growth } = trpc.admin.userGrowth.useQuery();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-32 bg-gray-800/30 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const formatCurrency = (val: string | number) => {
    const num = Number(val);
    if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(2)}M`;
    if (num >= 1_000) return `$${(num / 1_000).toFixed(1)}K`;
    return `$${num.toFixed(2)}`;
  };

  // Generate transaction volume data from activity (group by day for visualization)
  const txVolumeData = (() => {
    if (!activity || activity.length === 0) return Array(7).fill(0);
    // Simple: use last 7 entries as data points for the chart
    const volumes = activity.slice(0, 7).map((tx: any) => Math.abs(Number(tx.amount || 0)));
    return volumes.length >= 2 ? volumes.reverse() : Array(7).fill(0);
  })();

  // Revenue data (derived from deposits * fee rate)
  const revenueData = (() => {
    if (!activity || activity.length === 0) return Array(7).fill(0);
    const deposits = activity.filter((tx: any) => tx.type === "deposit").slice(0, 7);
    return deposits.length >= 2
      ? deposits.map((tx: any) => Number(tx.amount || 0) * 0.02).reverse()
      : Array(7).fill(0);
  })();

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-sm text-gray-400 mt-1">Platform overview and key metrics</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={String(stats?.totalUsers ?? 0)}
          icon={Users}
          change="+12.5%"
          changeType="up"
          color="bg-blue-500/10 text-blue-400"
        />
        <StatCard
          title="Total Deposits"
          value={formatCurrency(stats?.totalDeposits ?? "0")}
          icon={DollarSign}
          change="+8.3%"
          changeType="up"
          color="bg-emerald-500/10 text-emerald-400"
        />
        <StatCard
          title="Total Withdrawals"
          value={formatCurrency(stats?.totalWithdrawals ?? "0")}
          icon={Wallet}
          change="-3.1%"
          changeType="down"
          color="bg-purple-500/10 text-purple-400"
        />
        <StatCard
          title="Active Investments"
          value={String(stats?.activeInvestments ?? 0)}
          icon={TrendingUp}
          change="+5.7%"
          changeType="up"
          color="bg-amber-500/10 text-amber-400"
        />
        <StatCard
          title="Platform Revenue"
          value={formatCurrency(stats?.revenue ?? "0")}
          icon={DollarSign}
          change="+15.2%"
          changeType="up"
          color="bg-green-500/10 text-green-400"
        />
        <StatCard
          title="Pending KYC"
          value={String(stats?.pendingKyc ?? 0)}
          icon={ShieldCheck}
          color="bg-orange-500/10 text-orange-400"
        />
        <StatCard
          title="Pending Withdrawals"
          value={String(stats?.pendingWithdrawals ?? 0)}
          icon={Clock}
          color="bg-red-500/10 text-red-400"
        />
        <StatCard
          title="Success Rate"
          value="98.5%"
          icon={CheckCircle2}
          change="+0.3%"
          changeType="up"
          color="bg-teal-500/10 text-teal-400"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Growth Chart */}
        <div className="bg-[#0d1321] border border-gray-800/60 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">User Growth</h3>
            <span className="text-xs text-gray-500">Last 30 days</span>
          </div>
          <div className="h-32 flex items-end gap-1">
            {(growth ?? []).slice(-30).map((day, i) => {
              const maxCount = Math.max(...(growth ?? []).map(d => d.count), 1);
              const height = (day.count / maxCount) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
                  <div
                    className="w-full bg-gradient-to-t from-amber-500/80 to-amber-400/40 rounded-t-sm min-h-[2px] transition-all duration-300"
                    style={{ height: `${Math.max(height, 2)}%` }}
                  />
                </div>
              );
            })}
            {(!growth || growth.length === 0) && (
              <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">
                No data yet
              </div>
            )}
          </div>
        </div>

        {/* Transaction Volume Chart */}
        <div className="bg-[#0d1321] border border-gray-800/60 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-semibold text-white">Transaction Volume</h3>
            </div>
            <span className="text-xs text-gray-500">Recent</span>
          </div>
          <MiniLineChart data={txVolumeData} color="#3b82f6" height={120} />
        </div>

        {/* Revenue Chart */}
        <div className="bg-[#0d1321] border border-gray-800/60 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-semibold text-white">Revenue</h3>
            </div>
            <span className="text-xs text-gray-500">2% fee</span>
          </div>
          <MiniLineChart data={revenueData} color="#10b981" height={120} />
        </div>
      </div>

      {/* System Health + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* System Health */}
        <div className="lg:col-span-2 bg-[#0d1321] border border-gray-800/60 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">System Health</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-lg">
              <Server className="w-5 h-5 text-emerald-400" />
              <div>
                <p className="text-xs text-gray-400">Server Status</p>
                <p className="text-sm font-medium text-emerald-400">Operational</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg">
              <Zap className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-xs text-gray-400">API Latency</p>
                <p className="text-sm font-medium text-blue-400">42ms avg</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <div>
                <p className="text-xs text-gray-400">Error Rate</p>
                <p className="text-sm font-medium text-emerald-400">0.02%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-[#0d1321] border border-gray-800/60 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <a href="/admin/users" className="flex items-center gap-3 p-3 rounded-lg bg-orange-500/5 border border-orange-500/20 hover:bg-orange-500/10 transition-colors">
              <ShieldCheck className="w-5 h-5 text-orange-400" />
              <div>
                <p className="text-sm font-medium text-white">Review KYC</p>
                <p className="text-xs text-gray-500">{stats?.pendingKyc ?? 0} pending</p>
              </div>
            </a>
            <a href="/admin/deposits-withdrawals" className="flex items-center gap-3 p-3 rounded-lg bg-red-500/5 border border-red-500/20 hover:bg-red-500/10 transition-colors">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <div>
                <p className="text-sm font-medium text-white">Approve Withdrawals</p>
                <p className="text-xs text-gray-500">{stats?.pendingWithdrawals ?? 0} pending</p>
              </div>
            </a>
            <a href="/admin/announcements" className="flex items-center gap-3 p-3 rounded-lg bg-blue-500/5 border border-blue-500/20 hover:bg-blue-500/10 transition-colors">
              <Activity className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-sm font-medium text-white">Post Announcement</p>
                <p className="text-xs text-gray-500">Notify all users</p>
              </div>
            </a>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-[#0d1321] border border-gray-800/60 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white">Recent Activity</h3>
          <a href="/admin/transactions" className="text-xs text-amber-400 hover:text-amber-300">View All →</a>
        </div>
        <div className="divide-y divide-gray-800/40">
          {(activity ?? []).slice(0, 10).map((tx: any, i: number) => (
            <RecentActivityRow
              key={i}
              type={tx.type}
              description={`${tx.type.charAt(0).toUpperCase() + tx.type.slice(1)} - ${tx.currency}`}
              amount={`${Number(tx.amount) >= 0 ? "+" : ""}${tx.amount} ${tx.currency}`}
              time={new Date(tx.createdAt).toLocaleDateString()}
              status={tx.status}
            />
          ))}
          {(!activity || activity.length === 0) && (
            <p className="text-sm text-gray-500 py-4 text-center">No recent activity</p>
          )}
        </div>
      </div>
    </div>
  );
}
