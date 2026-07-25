import { useState } from "react";
import { trpc } from "@/lib/trpc";
import {
  Search, ChevronLeft, ChevronRight, ShieldCheck, ShieldX,
  Crown, User, MoreVertical, Ban, UserCheck, Loader2,
  DollarSign, X,
} from "lucide-react";
import { toast } from "sonner";

// Reject KYC dialog
function RejectKycDialog({ userId, onClose, onSuccess }: { userId: number; onClose: () => void; onSuccess: () => void }) {
  const [reason, setReason] = useState("");
  const rejectKyc = trpc.admin.users.rejectKyc.useMutation({
    onSuccess: () => { onSuccess(); onClose(); toast.success("KYC rejected"); },
    onError: (e) => toast.error(e.message),
  });

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[#0d1321] border border-gray-700 rounded-xl p-6 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Reject KYC Verification</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <p className="text-sm text-gray-400 mb-3">Please provide a reason for rejecting this user's KYC submission. The user will be notified.</p>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          placeholder="e.g., Documents are unclear, ID expired, name mismatch..."
          className="w-full px-3 py-2 bg-[#080d19] border border-gray-800 rounded-lg text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-red-500/50 resize-none"
        />
        <div className="flex items-center gap-3 mt-4">
          <button
            onClick={() => rejectKyc.mutate({ userId, reason: reason.trim() || undefined })}
            disabled={rejectKyc.isPending}
            className="h-9 px-4 bg-red-500 text-white font-medium rounded-lg text-sm hover:bg-red-400 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {rejectKyc.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Reject KYC
          </button>
          <button onClick={onClose} className="h-9 px-4 bg-gray-800 text-gray-300 rounded-lg text-sm hover:bg-gray-700 transition-colors">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// Wallet Credit/Debit dialog
function WalletDialog({ userId, userName, onClose, onSuccess }: { userId: number; userName: string; onClose: () => void; onSuccess: () => void }) {
  const [mode, setMode] = useState<"credit" | "debit">("credit");
  const [currency, setCurrency] = useState("USDT");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");

  const creditMutation = trpc.admin.wallet.credit.useMutation({
    onSuccess: () => { onSuccess(); onClose(); toast.success("Wallet credited"); },
    onError: (e) => toast.error(e.message),
  });
  const debitMutation = trpc.admin.wallet.debit.useMutation({
    onSuccess: () => { onSuccess(); onClose(); toast.success("Wallet debited"); },
    onError: (e) => toast.error(e.message),
  });

  const handleSubmit = () => {
    if (!amount || Number(amount) <= 0) { toast.error("Enter a valid amount"); return; }
    const payload = { userId, currency, amount, reason: reason.trim() || undefined };
    if (mode === "credit") creditMutation.mutate(payload);
    else debitMutation.mutate(payload);
  };

  const isPending = creditMutation.isPending || debitMutation.isPending;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[#0d1321] border border-gray-700 rounded-xl p-6 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Wallet Adjustment</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <p className="text-sm text-gray-400 mb-4">Adjust wallet for <span className="text-white font-medium">{userName}</span></p>

        <div className="flex gap-2 mb-4">
          <button onClick={() => setMode("credit")}
            className={`flex-1 h-9 rounded-lg text-sm font-medium transition-colors ${mode === "credit" ? "bg-emerald-500 text-white" : "bg-gray-800 text-gray-400 hover:text-white"}`}>
            Credit
          </button>
          <button onClick={() => setMode("debit")}
            className={`flex-1 h-9 rounded-lg text-sm font-medium transition-colors ${mode === "debit" ? "bg-red-500 text-white" : "bg-gray-800 text-gray-400 hover:text-white"}`}>
            Debit
          </button>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Currency</label>
              <select value={currency} onChange={(e) => setCurrency(e.target.value)}
                className="w-full h-9 px-3 bg-[#080d19] border border-gray-800 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500/50">
                <option value="USDT">USDT</option>
                <option value="BTC">BTC</option>
                <option value="ETH">ETH</option>
                <option value="GOLD">GOLD</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Amount</label>
              <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} step="0.01" min="0"
                className="w-full h-9 px-3 bg-[#080d19] border border-gray-800 rounded-lg text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-amber-500/50"
                placeholder="0.00" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Reason (optional)</label>
            <input type="text" value={reason} onChange={(e) => setReason(e.target.value)}
              className="w-full h-9 px-3 bg-[#080d19] border border-gray-800 rounded-lg text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-amber-500/50"
              placeholder="Admin adjustment..." />
          </div>
        </div>

        <div className="flex items-center gap-3 mt-5">
          <button onClick={handleSubmit} disabled={isPending}
            className={`h-9 px-4 font-medium rounded-lg text-sm transition-colors disabled:opacity-50 flex items-center gap-2 ${
              mode === "credit" ? "bg-emerald-500 text-white hover:bg-emerald-400" : "bg-red-500 text-white hover:bg-red-400"
            }`}>
            {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {mode === "credit" ? "Credit Wallet" : "Debit Wallet"}
          </button>
          <button onClick={onClose} className="h-9 px-4 bg-gray-800 text-gray-300 rounded-lg text-sm hover:bg-gray-700 transition-colors">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminUsers() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [kycFilter, setKycFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [rejectKycUser, setRejectKycUser] = useState<number | null>(null);
  const [walletUser, setWalletUser] = useState<{ id: number; name: string } | null>(null);
  const limit = 20;

  const { data, isLoading, refetch } = trpc.admin.users.list.useQuery({
    limit, offset: page * limit, search: search || undefined,
    role: roleFilter !== "all" ? roleFilter : undefined,
    kycStatus: kycFilter !== "all" ? kycFilter : undefined,
  });

  const updateUser = trpc.admin.users.update.useMutation({
    onSuccess: () => { refetch(); toast.success("User updated"); setSelectedUser(null); },
    onError: (e) => toast.error(e.message),
  });
  const approveKyc = trpc.admin.users.approveKyc.useMutation({
    onSuccess: () => { refetch(); toast.success("KYC approved"); setSelectedUser(null); },
    onError: (e) => toast.error(e.message),
  });

  const kycBadge = (status: string) => {
    const colors: Record<string, string> = {
      verified: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
      pending: "text-amber-400 bg-amber-400/10 border-amber-400/20",
      rejected: "text-red-400 bg-red-400/10 border-red-400/20",
      unverified: "text-gray-400 bg-gray-400/10 border-gray-400/20",
    };
    return colors[status] ?? colors.unverified;
  };

  const tierBadge = (tier: string) => {
    const colors: Record<string, string> = {
      bronze: "text-orange-400",
      silver: "text-gray-300",
      gold: "text-amber-400",
      platinum: "text-cyan-400",
      diamond: "text-blue-400",
      legendary: "text-purple-400",
    };
    return colors[tier] ?? colors.bronze;
  };

  const totalPages = Math.ceil((data?.total ?? 0) / limit);

  return (
    <div className="space-y-6">
      {/* Reject KYC Dialog */}
      {rejectKycUser && (
        <RejectKycDialog
          userId={rejectKycUser}
          onClose={() => setRejectKycUser(null)}
          onSuccess={() => refetch()}
        />
      )}

      {/* Wallet Dialog */}
      {walletUser && (
        <WalletDialog
          userId={walletUser.id}
          userName={walletUser.name}
          onClose={() => setWalletUser(null)}
          onSuccess={() => refetch()}
        />
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">User Management</h1>
          <p className="text-sm text-gray-400 mt-1">{data?.total ?? 0} total users</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search by name, email, or username..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            className="w-full h-10 pl-10 pr-4 bg-[#0d1321] border border-gray-800 rounded-lg text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-amber-500/50"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(0); }}
          className="h-10 px-3 bg-[#0d1321] border border-gray-800 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500/50"
        >
          <option value="all">All Roles</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
        <select
          value={kycFilter}
          onChange={(e) => { setKycFilter(e.target.value); setPage(0); }}
          className="h-10 px-3 bg-[#0d1321] border border-gray-800 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500/50"
        >
          <option value="all">All KYC</option>
          <option value="verified">Verified</option>
          <option value="pending">Pending</option>
          <option value="rejected">Rejected</option>
          <option value="unverified">Unverified</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-[#0d1321] border border-gray-800/60 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800/60">
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3">User</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3">Email</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3">Role</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3">KYC</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3">Tier</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3">Status</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3">Joined</th>
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
                (data?.users ?? []).map((u: any) => (
                  <tr key={u.id} className="border-b border-gray-800/30 hover:bg-gray-800/20 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-xs font-bold text-black">
                          {u.name?.[0] ?? "?"}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{u.name ?? "—"}</p>
                          <p className="text-xs text-gray-500">@{u.username ?? "—"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-300">{u.email ?? "—"}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${u.role === "admin" ? "text-amber-400 bg-amber-400/10" : "text-gray-400 bg-gray-400/10"}`}>
                        {u.role === "admin" ? "Admin" : "User"}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full border ${kycBadge(u.kycStatus ?? "unverified")}`}>
                        {u.kycStatus ?? "unverified"}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-medium capitalize ${tierBadge(u.tier ?? "bronze")}`}>
                        {u.tier ?? "bronze"}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${u.isOnline ? "text-emerald-400 bg-emerald-400/10" : "text-gray-500 bg-gray-500/10"}`}>
                        {u.isOnline ? "Online" : "Offline"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs text-gray-500">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-5 py-3">
                      <div className="relative">
                        <button
                          onClick={() => setSelectedUser(selectedUser === u.id ? null : u.id)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        {selectedUser === u.id && (
                          <div className="absolute right-0 top-10 z-50 w-52 bg-[#1a2035] border border-gray-700 rounded-lg shadow-xl py-1">
                            {u.kycStatus === "pending" && (
                              <>
                                <button
                                  onClick={() => { approveKyc.mutate({ userId: u.id }); }}
                                  className="w-full text-left px-4 py-2 text-sm text-emerald-400 hover:bg-gray-800/50 flex items-center gap-2"
                                >
                                  <ShieldCheck className="w-4 h-4" /> Approve KYC
                                </button>
                                <button
                                  onClick={() => { setRejectKycUser(u.id); setSelectedUser(null); }}
                                  className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-800/50 flex items-center gap-2"
                                >
                                  <ShieldX className="w-4 h-4" /> Reject KYC...
                                </button>
                              </>
                            )}
                            {u.role !== "admin" && (
                              <button
                                onClick={() => updateUser.mutate({ id: u.id, role: "admin" })}
                                className="w-full text-left px-4 py-2 text-sm text-amber-400 hover:bg-gray-800/50 flex items-center gap-2"
                              >
                                <Crown className="w-4 h-4" /> Promote to Admin
                              </button>
                            )}
                            {u.role === "admin" && (
                              <button
                                onClick={() => updateUser.mutate({ id: u.id, role: "user" })}
                                className="w-full text-left px-4 py-2 text-sm text-gray-400 hover:bg-gray-800/50 flex items-center gap-2"
                              >
                                <User className="w-4 h-4" /> Demote to User
                              </button>
                            )}
                            {/* Ban / Unban */}
                            {u.isOnline ? (
                              <button
                                onClick={() => { updateUser.mutate({ id: u.id, ...({ isOnline: false } as any) }); toast.info("User banned (set offline)"); }}
                                className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-800/50 flex items-center gap-2"
                              >
                                <Ban className="w-4 h-4" /> Ban User
                              </button>
                            ) : (
                              <button
                                onClick={() => { updateUser.mutate({ id: u.id, ...({ isOnline: true } as any) }); toast.info("User unbanned"); }}
                                className="w-full text-left px-4 py-2 text-sm text-emerald-400 hover:bg-gray-800/50 flex items-center gap-2"
                              >
                                <UserCheck className="w-4 h-4" /> Unban User
                              </button>
                            )}
                            {/* Wallet */}
                            <button
                              onClick={() => { setWalletUser({ id: u.id, name: u.name ?? u.username ?? "User" }); setSelectedUser(null); }}
                              className="w-full text-left px-4 py-2 text-sm text-blue-400 hover:bg-gray-800/50 flex items-center gap-2"
                            >
                              <DollarSign className="w-4 h-4" /> Credit/Debit Wallet
                            </button>
                            <div className="border-t border-gray-700 my-1" />
                            <button
                              onClick={() => setSelectedUser(null)}
                              className="w-full text-left px-4 py-2 text-sm text-gray-500 hover:bg-gray-800/50"
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-800/60">
            <p className="text-xs text-gray-500">
              Showing {page * limit + 1}–{Math.min((page + 1) * limit, data?.total ?? 0)} of {data?.total ?? 0}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-800/50 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs text-gray-400">{page + 1} / {totalPages}</span>
              <button
                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                disabled={page >= totalPages - 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-800/50 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
