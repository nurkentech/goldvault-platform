import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { CheckCircle2, XCircle, ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { toast } from "sonner";

export default function AdminDepositsWithdrawals() {
  const [tab, setTab] = useState<"deposits" | "withdrawals">("deposits");
  const [statusFilter, setStatusFilter] = useState("pending");

  const { data: deposits, isLoading: loadingDeposits, refetch: refetchDeposits } = trpc.admin.transactions.list.useQuery({
    limit: 50, offset: 0, type: "deposit", status: statusFilter !== "all" ? statusFilter : undefined,
  });

  const { data: withdrawals, isLoading: loadingWithdrawals, refetch: refetchWithdrawals } = trpc.admin.transactions.list.useQuery({
    limit: 50, offset: 0, type: "withdrawal", status: statusFilter !== "all" ? statusFilter : undefined,
  });

  const updateTx = trpc.admin.transactions.update.useMutation({
    onSuccess: () => { refetchDeposits(); refetchWithdrawals(); toast.success("Transaction updated"); },
    onError: (e) => toast.error(e.message),
  });

  const currentData = tab === "deposits" ? deposits : withdrawals;
  const isLoading = tab === "deposits" ? loadingDeposits : loadingWithdrawals;

  const pendingDeposits = deposits?.transactions?.filter((t: any) => t.status === "pending").length ?? 0;
  const pendingWithdrawals = withdrawals?.transactions?.filter((t: any) => t.status === "pending").length ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Deposits & Withdrawals</h1>
        <p className="text-sm text-gray-400 mt-1">Review and approve pending deposits and withdrawal requests</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-[#0d1321] border border-gray-800/60 rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-400/10 flex items-center justify-center">
            <ArrowDownCircle className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <p className="text-sm text-gray-400">Pending Deposits</p>
            <p className="text-2xl font-bold text-white">{pendingDeposits}</p>
          </div>
        </div>
        <div className="bg-[#0d1321] border border-gray-800/60 rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-400/10 flex items-center justify-center">
            <ArrowUpCircle className="w-6 h-6 text-red-400" />
          </div>
          <div>
            <p className="text-sm text-gray-400">Pending Withdrawals</p>
            <p className="text-2xl font-bold text-white">{pendingWithdrawals}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-gray-800/60 pb-0">
        <button onClick={() => setTab("deposits")}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors ${tab === "deposits" ? "border-amber-500 text-amber-400" : "border-transparent text-gray-500 hover:text-gray-300"}`}>
          Deposits {pendingDeposits > 0 && <span className="ml-1 px-1.5 py-0.5 text-xs bg-amber-500/20 text-amber-400 rounded-full">{pendingDeposits}</span>}
        </button>
        <button onClick={() => setTab("withdrawals")}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors ${tab === "withdrawals" ? "border-amber-500 text-amber-400" : "border-transparent text-gray-500 hover:text-gray-300"}`}>
          Withdrawals {pendingWithdrawals > 0 && <span className="ml-1 px-1.5 py-0.5 text-xs bg-red-500/20 text-red-400 rounded-full">{pendingWithdrawals}</span>}
        </button>
        <div className="ml-auto">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="h-8 px-3 bg-gray-800/50 border border-gray-700 rounded-lg text-xs text-white focus:outline-none">
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="failed">Failed</option>
            <option value="all">All</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#0d1321] border border-gray-800/60 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800/60">
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3">ID</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3">User</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3">Amount</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3">Currency</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3">Address</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3">Status</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3">Date</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-800/30">
                    <td colSpan={8} className="px-5 py-4"><div className="h-8 bg-gray-800/30 rounded animate-pulse" /></td>
                  </tr>
                ))
              ) : (currentData?.transactions ?? []).length === 0 ? (
                <tr><td colSpan={8} className="px-5 py-12 text-center text-gray-500 text-sm">
                  No {statusFilter === "all" ? "" : statusFilter} {tab} found
                </td></tr>
              ) : (
                (currentData?.transactions ?? []).map((tx: any) => (
                  <tr key={tx.id} className="border-b border-gray-800/30 hover:bg-gray-800/20 transition-colors">
                    <td className="px-5 py-3 text-sm text-gray-400">#{tx.id}</td>
                    <td className="px-5 py-3 text-sm text-gray-300">{tx.userId}</td>
                    <td className="px-5 py-3 text-sm font-medium text-white">{tx.amount}</td>
                    <td className="px-5 py-3 text-sm text-gray-300">{tx.currency}</td>
                    <td className="px-5 py-3 text-xs text-gray-500 font-mono max-w-[120px] truncate">{tx.toAddress || "—"}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        tx.status === "confirmed" ? "text-emerald-400 bg-emerald-400/10" :
                        tx.status === "pending" ? "text-amber-400 bg-amber-400/10" : "text-red-400 bg-red-400/10"
                      }`}>{tx.status}</span>
                    </td>
                    <td className="px-5 py-3 text-xs text-gray-500">{tx.createdAt ? new Date(tx.createdAt).toLocaleString() : "—"}</td>
                    <td className="px-5 py-3">
                      {tx.status === "pending" && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => updateTx.mutate({ id: tx.id, status: "confirmed" })}
                            className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-emerald-500/10 text-emerald-400 transition-colors"
                            title="Approve"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => updateTx.mutate({ id: tx.id, status: "failed" })}
                            className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-red-500/10 text-red-400 transition-colors"
                            title="Reject"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
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
