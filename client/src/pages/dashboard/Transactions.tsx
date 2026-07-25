/**
 * Transactions — Full transaction history with filters, date range, sorting, and detail modal
 */
import { useState, useMemo } from "react";
import UserDashboardLayout from "@/components/UserDashboardLayout";
import { trpc } from "@/lib/trpc";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Download, ArrowDownToLine, ArrowUpFromLine, ArrowLeftRight,
  TrendingUp, Gift, Users, X, Calendar, ArrowUpDown, ChevronDown, Eye,
  Clock, CheckCircle, AlertCircle, Loader2
} from "lucide-react";
import { downloadTransactionReceipt } from "@/lib/pdfReceipt";
import { useCurrency } from "@/lib/currency";

const typeIcons: Record<string, React.ElementType> = {
  deposit: ArrowDownToLine,
  withdrawal: ArrowUpFromLine,
  transfer: ArrowLeftRight,
  exchange: ArrowLeftRight,
  investment: TrendingUp,
  profit: TrendingUp,
  referral: Users,
  reward: Gift,
  buy: ArrowDownToLine,
};

const typeColors: Record<string, string> = {
  deposit: "text-emerald-400 bg-emerald-500/10",
  withdrawal: "text-red-400 bg-red-500/10",
  transfer: "text-blue-400 bg-blue-500/10",
  exchange: "text-purple-400 bg-purple-500/10",
  investment: "text-amber-400 bg-amber-500/10",
  profit: "text-emerald-400 bg-emerald-500/10",
  referral: "text-cyan-400 bg-cyan-500/10",
  reward: "text-pink-400 bg-pink-500/10",
  buy: "text-emerald-400 bg-emerald-500/10",
};

const statusColors: Record<string, string> = {
  completed: "text-emerald-400 bg-emerald-500/10",
  pending: "text-amber-400 bg-amber-500/10",
  failed: "text-red-400 bg-red-500/10",
  processing: "text-blue-400 bg-blue-500/10",
};

const statusIcons: Record<string, React.ElementType> = {
  completed: CheckCircle,
  pending: Clock,
  failed: AlertCircle,
  processing: Loader2,
};

type SortField = "date" | "amount";
type SortDir = "asc" | "desc";

export default function Transactions() {
  return (
    <UserDashboardLayout>
      <TransactionsContent />
    </UserDashboardLayout>
  );
}

function TransactionsContent() {
  const { formatUsd } = useCurrency();
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [selectedTx, setSelectedTx] = useState<any>(null);
  const [showFilters, setShowFilters] = useState(false);

  const { data: transactions, isLoading } = trpc.transaction.list.useQuery({ limit: 200 });
  const { data: marketPrices = [] } = trpc.market.prices.useQuery(undefined, { staleTime: 30_000 });

  const filters = ["all", "deposit", "withdrawal", "exchange", "investment", "profit", "referral"];

  const filteredTxns = useMemo(() => {
    let result = transactions ?? [];

    // Type filter
    if (filter !== "all") result = result.filter(tx => tx.type === filter);

    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(tx =>
        tx.note?.toLowerCase().includes(q) ||
        tx.type.toLowerCase().includes(q) ||
        tx.currency?.toLowerCase().includes(q) ||
        tx.amount?.toString().includes(q)
      );
    }

    // Date range filter
    if (dateFrom) {
      const from = new Date(dateFrom).getTime();
      result = result.filter(tx => new Date(tx.createdAt).getTime() >= from);
    }
    if (dateTo) {
      const to = new Date(dateTo).getTime() + 86400000; // end of day
      result = result.filter(tx => new Date(tx.createdAt).getTime() <= to);
    }

    // Sorting
    result = [...result].sort((a, b) => {
      if (sortField === "date") {
        const diff = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        return sortDir === "asc" ? diff : -diff;
      }
      const diff = parseFloat(a.amount) - parseFloat(b.amount);
      return sortDir === "asc" ? diff : -diff;
    });

    return result;
  }, [transactions, filter, searchQuery, dateFrom, dateTo, sortField, sortDir]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(d => d === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  const handleExportCSV = () => {
    if (!filteredTxns.length) return;
    const headers = ["Date", "Type", "Description", "Amount", "Currency", "Status"];
    const rows = filteredTxns.map(tx => [
      new Date(tx.createdAt).toISOString(),
      tx.type,
      tx.note || "",
      tx.amount,
      tx.currency || "USD",
      tx.status,
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transactions_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-foreground">Transactions</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {filteredTxns.length} transaction{filteredTxns.length !== 1 ? "s" : ""}
            {filter !== "all" && ` (${filter})`}
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors"
        >
          <Download className="w-3.5 h-3.5" /> Export CSV
        </button>
      </div>

      {/* Search & Filters */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="relative flex-1 w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by type, note, currency..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium transition-colors ${
              showFilters || dateFrom || dateTo ? "bg-amber-500/10 text-amber-400 border border-amber-500/30" : "bg-white/5 text-muted-foreground border border-white/10 hover:text-foreground"
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            Date Range
            <ChevronDown className={`w-3 h-3 transition-transform ${showFilters ? "rotate-180" : ""}`} />
          </button>
        </div>

        {/* Date Range Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-xl">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <label className="text-xs text-muted-foreground">From:</label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  />
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <label className="text-xs text-muted-foreground">To:</label>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  />
                </div>
                {(dateFrom || dateTo) && (
                  <button
                    onClick={() => { setDateFrom(""); setDateTo(""); }}
                    className="text-xs text-red-400 hover:text-red-300 ml-auto"
                  >
                    Clear
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Type Filters */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                filter === f ? "bg-amber-500 text-black" : "bg-white/5 text-muted-foreground hover:text-foreground hover:bg-white/10"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Transaction Table */}
      <div className="bg-card/50 border border-white/5 rounded-2xl overflow-hidden">
        {/* Table Header */}
        <div className="hidden md:grid grid-cols-[1fr_1.5fr_1fr_1fr_1fr_0.5fr] gap-4 px-5 py-3 border-b border-white/5 text-xs text-muted-foreground font-medium">
          <span>Type</span>
          <span>Description</span>
          <button onClick={() => toggleSort("amount")} className="flex items-center gap-1 hover:text-foreground transition-colors">
            Amount
            <ArrowUpDown className={`w-3 h-3 ${sortField === "amount" ? "text-amber-400" : ""}`} />
          </button>
          <span>Status</span>
          <button onClick={() => toggleSort("date")} className="flex items-center gap-1 hover:text-foreground transition-colors">
            Date
            <ArrowUpDown className={`w-3 h-3 ${sortField === "date" ? "text-amber-400" : ""}`} />
          </button>
          <span></span>
        </div>

        {/* Rows */}
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="grid grid-cols-2 md:grid-cols-[1fr_1.5fr_1fr_1fr_1fr_0.5fr] gap-4 px-5 py-4 border-b border-white/5">
              <div className="h-4 bg-white/5 rounded animate-pulse" />
              <div className="h-4 bg-white/5 rounded animate-pulse" />
              <div className="h-4 bg-white/5 rounded animate-pulse" />
              <div className="h-4 bg-white/5 rounded animate-pulse" />
              <div className="h-4 bg-white/5 rounded animate-pulse" />
              <div className="h-4 bg-white/5 rounded animate-pulse" />
            </div>
          ))
        ) : filteredTxns.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p className="text-sm text-muted-foreground">No transactions found</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Try adjusting your filters or date range</p>
          </div>
        ) : (
          filteredTxns.map((tx, i) => {
            const Icon = typeIcons[tx.type] || ArrowLeftRight;
            const colorClass = typeColors[tx.type] || "text-gray-400 bg-gray-500/10";
            const statusClass = statusColors[tx.status] || "text-gray-400 bg-gray-500/10";
            const isPositive = ["deposit", "profit", "referral", "reward"].includes(tx.type);

            return (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: Math.min(i * 0.015, 0.3) }}
                className="grid grid-cols-[1fr_auto] md:grid-cols-[1fr_1.5fr_1fr_1fr_1fr_0.5fr] gap-3 md:gap-4 px-4 md:px-5 py-3.5 border-b border-white/5 hover:bg-white/[0.02] transition-colors items-center"
              >
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${colorClass}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-medium text-foreground capitalize">{tx.type}</span>
                </div>
                <span className="text-xs text-muted-foreground truncate">{tx.note || tx.type + " " + (tx.currency || "USD")}</span>
                <span className={`text-xs font-semibold ${isPositive ? "text-emerald-400" : "text-red-400"}`}>
                  {isPositive ? "+" : "-"}{formatUsd(transactionUsdValue(tx, marketPrices))}
                </span>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full w-fit ${statusClass}`}>
                  {tx.status}
                </span>
                <span className="text-xs text-muted-foreground">
                  {new Date(tx.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
                <button
                  onClick={() => setSelectedTx(tx)}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Transaction Detail Modal */}
      <AnimatePresence>
        {selectedTx && (
          <TransactionDetailModal tx={selectedTx} onClose={() => setSelectedTx(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Transaction Detail Modal ────────────────────────────────────────────────

function transactionUsdValue(tx: any, prices: Array<{ symbol: string; price: number }>) {
  const currency = tx.currency ?? "USD";
  const amount = Math.abs(Number(tx.amount) || 0);
  if (["USD", "USDT", "USDC"].includes(currency)) return amount;
  const symbol = ["XAU", "PAXG", "XAUT"].includes(currency) ? "GOLD" : currency;
  return amount * (prices.find((price) => price.symbol === symbol)?.price ?? 0);
}

function TransactionDetailModal({ tx, onClose }: { tx: any; onClose: () => void }) {
  const { formatUsd } = useCurrency();
  const { data: marketPrices = [] } = trpc.market.prices.useQuery(undefined, { staleTime: 30_000 });
  const Icon = typeIcons[tx.type] || ArrowLeftRight;
  const colorClass = typeColors[tx.type] || "text-gray-400 bg-gray-500/10";
  const statusClass = statusColors[tx.status] || "text-gray-400 bg-gray-500/10";
  const StatusIcon = statusIcons[tx.status] || Clock;
  const isPositive = ["deposit", "profit", "referral", "reward"].includes(tx.type);

  // Parse metadata if it exists
  let metadata: Record<string, any> = {};
  try {
    if (tx.metadata) {
      metadata = typeof tx.metadata === "string" ? JSON.parse(tx.metadata) : tx.metadata;
    }
  } catch { /* ignore */ }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", duration: 0.4 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-card border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorClass}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground capitalize">{tx.type}</h3>
              <p className="text-[10px] text-muted-foreground">Transaction Details</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Amount */}
        <div className="p-5 text-center border-b border-white/5">
          <p className={`text-2xl font-bold ${isPositive ? "text-emerald-400" : "text-red-400"}`}>
            {isPositive ? "+" : "-"}{formatUsd(transactionUsdValue(tx, marketPrices))}
          </p>
          <p className="text-xs text-muted-foreground mt-1">{tx.currency || "USD"}</p>
        </div>

        {/* Details */}
        <div className="p-5 space-y-3">
          <DetailRow label="Status">
            <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${statusClass}`}>
              <StatusIcon className={`w-3 h-3 ${tx.status === "processing" ? "animate-spin" : ""}`} />
              {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
            </span>
          </DetailRow>

          <DetailRow label="Date & Time">
            <span className="text-xs text-foreground">
              {new Date(tx.createdAt).toLocaleString("en-US", {
                month: "short", day: "numeric", year: "numeric",
                hour: "2-digit", minute: "2-digit",
              })}
            </span>
          </DetailRow>

          <DetailRow label="Transaction ID">
            <code className="text-[10px] text-amber-400 font-mono bg-amber-500/5 px-2 py-0.5 rounded">{tx.id}</code>
          </DetailRow>

          {tx.note && (
            <DetailRow label="Note">
              <span className="text-xs text-foreground">{tx.note}</span>
            </DetailRow>
          )}

          {/* Metadata Details */}
          {metadata.method && (
            <DetailRow label="Method">
              <span className="text-xs text-foreground capitalize">{metadata.method.replace(/_/g, " ")}</span>
            </DetailRow>
          )}

          {metadata.destination && (
            <DetailRow label="Destination">
              <span className="text-xs text-foreground font-mono break-all">{metadata.destination}</span>
            </DetailRow>
          )}

          {metadata.network && (
            <DetailRow label="Network">
              <span className="text-xs text-foreground">{metadata.network}</span>
            </DetailRow>
          )}

          {metadata.bankMethod && (
            <DetailRow label="Bank Method">
              <span className="text-xs text-foreground uppercase">{metadata.bankMethod}</span>
            </DetailRow>
          )}

          {metadata.accountName && (
            <DetailRow label="Account Holder">
              <span className="text-xs text-foreground">{metadata.accountName}</span>
            </DetailRow>
          )}

          {metadata.bankName && (
            <DetailRow label="Bank">
              <span className="text-xs text-foreground">{metadata.bankName}</span>
            </DetailRow>
          )}

          {metadata.provider && (
            <DetailRow label="Provider">
              <span className="text-xs text-foreground capitalize">{metadata.provider.replace(/_/g, " ")}</span>
            </DetailRow>
          )}

          {metadata.phoneNumber && (
            <DetailRow label="Phone Number">
              <span className="text-xs text-foreground font-mono">{metadata.phoneNumber}</span>
            </DetailRow>
          )}

          {metadata.cardLast4 && (
            <DetailRow label="Card">
              <span className="text-xs text-foreground">••••{metadata.cardLast4}</span>
            </DetailRow>
          )}

          {metadata.fee && (
            <DetailRow label="Fee">
              <span className="text-xs text-foreground">{metadata.fee}</span>
            </DetailRow>
          )}

          {metadata.symbol && (
            <DetailRow label="Asset">
              <span className="text-xs text-foreground font-semibold">{metadata.symbol}</span>
            </DetailRow>
          )}
        </div>

        {/* Status Timeline */}
        <div className="px-5 pb-5">
          <div className="bg-white/5 rounded-xl p-4">
            <p className="text-[10px] text-muted-foreground font-medium mb-3 uppercase tracking-wider">Status Timeline</p>
            <div className="space-y-3">
              <TimelineStep label="Request Created" time={tx.createdAt} completed />
              {tx.status === "processing" && <TimelineStep label="Processing" active />}
              {tx.status === "completed" && <TimelineStep label="Completed" time={tx.updatedAt || tx.createdAt} completed />}
              {tx.status === "failed" && <TimelineStep label="Failed" time={tx.updatedAt || tx.createdAt} failed />}
              {tx.status === "pending" && <TimelineStep label="Awaiting Approval" active />}
            </div>
          </div>
        </div>
        <div className="px-5 pb-5">
          <button
            onClick={() => downloadTransactionReceipt(tx)}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-xs font-semibold text-amber-400 hover:bg-amber-500/20"
          >
            <Download className="w-4 h-4" /> Download PDF Receipt
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between py-1.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      {children}
    </div>
  );
}

function TimelineStep({ label, time, completed, active, failed }: { label: string; time?: any; completed?: boolean; active?: boolean; failed?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`w-2 h-2 rounded-full shrink-0 ${
        completed ? "bg-emerald-400" : active ? "bg-amber-400 animate-pulse" : failed ? "bg-red-400" : "bg-white/20"
      }`} />
      <div className="flex-1 flex items-center justify-between">
        <span className={`text-xs ${completed || active || failed ? "text-foreground" : "text-muted-foreground"}`}>{label}</span>
        {time && (
          <span className="text-[10px] text-muted-foreground">
            {new Date(time).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
          </span>
        )}
      </div>
    </div>
  );
}
