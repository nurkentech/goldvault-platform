import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { TrendingUp, DollarSign, Clock, CheckCircle2 } from "lucide-react";

export default function AdminInvestments() {
  const [statusFilter, setStatusFilter] = useState("all");

  // Use transactions with type=investment as proxy for investments
  const { data, isLoading } = trpc.admin.transactions.list.useQuery({
    limit: 50, offset: 0,
    type: "buy",
    status: statusFilter !== "all" ? statusFilter : undefined,
  });

  const stats = [
    { label: "Active Plans", value: "24", icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-400/10" },
    { label: "Total Invested", value: "$148,500", icon: DollarSign, color: "text-amber-400", bg: "bg-amber-400/10" },
    { label: "Pending Payouts", value: "8", icon: Clock, color: "text-blue-400", bg: "bg-blue-400/10" },
    { label: "Completed Plans", value: "156", icon: CheckCircle2, color: "text-purple-400", bg: "bg-purple-400/10" },
  ];

  const investmentPlans = [
    { name: "Gold Accumulation Plan", roi: "15%", duration: "30 days", minAmount: "$500", status: "active", investors: 12 },
    { name: "Crypto Growth Plan", roi: "20%", duration: "60 days", minAmount: "$1,000", status: "active", investors: 8 },
    { name: "Premium Gold Reserve", roi: "25%", duration: "90 days", minAmount: "$5,000", status: "active", investors: 4 },
    { name: "Starter Savings Plan", roi: "10%", duration: "14 days", minAmount: "$100", status: "paused", investors: 0 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Investment Management</h1>
          <p className="text-sm text-gray-400 mt-1">Manage investment plans and monitor user portfolios</p>
        </div>
        <button className="h-10 px-4 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-medium rounded-lg text-sm hover:from-amber-400 hover:to-amber-500 transition-all">
          + Create Plan
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-[#0d1321] border border-gray-800/60 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-xs text-gray-500">{stat.label}</p>
                <p className="text-lg font-bold text-white">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Investment Plans */}
      <div className="bg-[#0d1321] border border-gray-800/60 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-800/60">
          <h2 className="text-lg font-semibold text-white">Investment Plans</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800/60">
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3">Plan Name</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3">ROI</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3">Duration</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3">Min Amount</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3">Investors</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3">Status</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {investmentPlans.map((plan) => (
                <tr key={plan.name} className="border-b border-gray-800/30 hover:bg-gray-800/20 transition-colors">
                  <td className="px-5 py-3 text-sm font-medium text-white">{plan.name}</td>
                  <td className="px-5 py-3 text-sm text-emerald-400 font-medium">{plan.roi}</td>
                  <td className="px-5 py-3 text-sm text-gray-300">{plan.duration}</td>
                  <td className="px-5 py-3 text-sm text-gray-300">{plan.minAmount}</td>
                  <td className="px-5 py-3 text-sm text-gray-300">{plan.investors}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      plan.status === "active" ? "text-emerald-400 bg-emerald-400/10" : "text-amber-400 bg-amber-400/10"
                    }`}>{plan.status}</span>
                  </td>
                  <td className="px-5 py-3">
                    <button className="text-xs text-amber-400 hover:text-amber-300 transition-colors">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Investment Transactions */}
      <div className="bg-[#0d1321] border border-gray-800/60 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-800/60 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Recent Investment Activity</h2>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="h-8 px-3 bg-gray-800/50 border border-gray-700 rounded-lg text-xs text-white focus:outline-none">
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800/60">
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3">ID</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3">User</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3">Amount</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3">Currency</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3">Status</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-800/30">
                    <td colSpan={6} className="px-5 py-4"><div className="h-6 bg-gray-800/30 rounded animate-pulse" /></td>
                  </tr>
                ))
              ) : (data?.transactions ?? []).length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-8 text-center text-gray-500 text-sm">No investment transactions found</td></tr>
              ) : (
                (data?.transactions ?? []).map((tx: any) => (
                  <tr key={tx.id} className="border-b border-gray-800/30 hover:bg-gray-800/20 transition-colors">
                    <td className="px-5 py-3 text-sm text-gray-400">#{tx.id}</td>
                    <td className="px-5 py-3 text-sm text-gray-300">{tx.userId}</td>
                    <td className="px-5 py-3 text-sm font-medium text-white">{tx.amount}</td>
                    <td className="px-5 py-3 text-sm text-gray-300">{tx.currency}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        tx.status === "confirmed" ? "text-emerald-400 bg-emerald-400/10" :
                        tx.status === "pending" ? "text-amber-400 bg-amber-400/10" : "text-red-400 bg-red-400/10"
                      }`}>{tx.status}</span>
                    </td>
                    <td className="px-5 py-3 text-xs text-gray-500">{tx.createdAt ? new Date(tx.createdAt).toLocaleString() : "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
