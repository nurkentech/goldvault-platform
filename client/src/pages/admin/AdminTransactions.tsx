import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Search, ChevronLeft, ChevronRight, CheckCircle2, XCircle, Clock, Flag } from "lucide-react";
import { toast } from "sonner";

export default function AdminTransactions() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(0);
  const limit = 25;

  const { data, isLoading, refetch } = trpc.admin.transactions.list.useQuery({
    limit, offset: page * limit,
    type: typeFilter !== "all" ? typeFilter : undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
    search: search || undefined,
  });

  const updateTx = trpc.admin.transactions.update.useMutation({
    onSuccess: () => { refetch(); toast.success("Transaction updated"); },
    onError: (e) => toast.error(e.message),
  });

  const statusColors: Record<string, string> = {
    confirmed: "text-emerald-400 bg-emerald-400/10",
    pending: "text-amber-400 bg-amber-400/10",
    failed: "text-red-400 bg-red-400/10",
  };

  const totalPages = Math.ceil((data?.total ?? 0) / limit);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Transaction Management</h1>
        <p className="text-sm text-gray-400 mt-1">{data?.total ?? 0} total transactions</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text" placeholder="Search by hash or address..."
            value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            className="w-full h-10 pl-10 pr-4 bg-[#0d1321] border border-gray-800 rounded-lg text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-amber-500/50"
          />
        </div>
        <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(0); }}
          className="h-10 px-3 bg-[#0d1321] border border-gray-800 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500/50">
          <option value="all">All Types</option>
          <option value="deposit">Deposit</option>
          <option value="withdrawal">Withdrawal</option>
          <option value="send">Send</option>
          <option value="receive">Receive</option>
          <option value="buy">Buy</option>
          <option value="sell">Sell</option>
          <option value="mint">Mint</option>
        </select>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
          className="h-10 px-3 bg-[#0d1321] border border-gray-800 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500/50">
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-[#0d1321] border border-gray-800/60 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800/60">
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3">ID</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3">Type</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3">Amount</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3">Currency</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3">User ID</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3">Status</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3">Date</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-800/30">
                    <td colSpan={8} className="px-5 py-4"><div className="h-8 bg-gray-800/30 rounded animate-pulse" /></td>
                  </tr>
                ))
              ) : (
                (data?.transactions ?? []).map((tx: any) => (
                  <tr key={tx.id} className="border-b border-gray-800/30 hover:bg-gray-800/20 transition-colors">
                    <td className="px-5 py-3 text-sm text-gray-400">#{tx.id}</td>
                    <td className="px-5 py-3">
                      <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-800 text-gray-300 capitalize">{tx.type}</span>
                    </td>
                    <td className="px-5 py-3 text-sm font-medium text-white">{tx.amount}</td>
                    <td className="px-5 py-3 text-sm text-gray-300">{tx.currency}</td>
                    <td className="px-5 py-3 text-sm text-gray-400">{tx.userId}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusColors[tx.status] ?? statusColors.pending}`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs text-gray-500">
                      {tx.createdAt ? new Date(tx.createdAt).toLocaleString() : "—"}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1">
                        {tx.status === "pending" && (
                          <>
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
                          </>
                        )}
                        <button
                          onClick={() => { updateTx.mutate({ id: tx.id, note: "FLAGGED: Suspicious transaction" }); toast.info(`Transaction #${tx.id} flagged as suspicious`); }}
                          className={`w-7 h-7 flex items-center justify-center rounded-md hover:bg-amber-500/10 transition-colors ${
                            tx.note?.includes("FLAGGED") ? "text-amber-400" : "text-gray-500 hover:text-amber-400"
                          }`}
                          title={tx.note?.includes("FLAGGED") ? "Already flagged" : "Flag as suspicious"}
                        >
                          <Flag className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-800/60">
            <p className="text-xs text-gray-500">Page {page + 1} of {totalPages}</p>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-800/50 text-gray-400 hover:text-white disabled:opacity-30">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => setPage(Math.min(totalPages - 1, page + 1))} disabled={page >= totalPages - 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-800/50 text-gray-400 hover:text-white disabled:opacity-30">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
