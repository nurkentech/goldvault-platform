/**
 * GoldCoinsTransfer Component
 * Design: Warm cream/champagne background, deep teal-navy primary, warm gold accents
 * Send GoldCoins to any in-app user by username or display name
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Search,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Zap,
  Clock,
  Gift,
  Star,
  TrendingUp,
  History,
  Users,
  Sparkles,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Step = "form" | "confirm" | "success";

interface AppUser {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  tier: string;
  coins: number;
  verified: boolean;
  mutualFriends: number;
}

interface TransferRecord {
  id: string;
  to: string;
  toAvatar: string;
  amount: number;
  reason: string;
  time: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const APP_USERS: AppUser[] = [
  { id: "1", username: "alexchen", displayName: "Alex Chen", avatar: "AC", tier: "Platinum", coins: 18400, verified: true, mutualFriends: 3 },
  { id: "2", username: "mariasantos", displayName: "Maria Santos", avatar: "MS", tier: "Gold", coins: 9800, verified: true, mutualFriends: 5 },
  { id: "3", username: "jameswright", displayName: "James Wright", avatar: "JW", tier: "Silver", coins: 4200, verified: false, mutualFriends: 1 },
  { id: "4", username: "priyapatel", displayName: "Priya Patel", avatar: "PP", tier: "Diamond", coins: 32100, verified: true, mutualFriends: 7 },
  { id: "5", username: "davidkim", displayName: "David Kim", avatar: "DK", tier: "Bronze", coins: 1560, verified: false, mutualFriends: 0 },
  { id: "6", username: "sofiarossi", displayName: "Sofia Rossi", avatar: "SR", tier: "Gold", coins: 11200, verified: true, mutualFriends: 4 },
  { id: "7", username: "goldtrader99", displayName: "Gold Trader", avatar: "GT", tier: "Legendary", coins: 88000, verified: true, mutualFriends: 2 },
];

const RECENT_TRANSFERS: TransferRecord[] = [
  { id: "1", to: "Alex Chen", toAvatar: "AC", amount: 500, reason: "Thanks for the tip!", time: "3h ago" },
  { id: "2", to: "Maria Santos", toAvatar: "MS", amount: 200, reason: "Challenge reward", time: "1d ago" },
  { id: "3", to: "Priya Patel", toAvatar: "PP", amount: 1000, reason: "Gold Rush bet", time: "3d ago" },
];

const QUICK_AMOUNTS = [50, 100, 250, 500, 1000];

const TIER_COLORS: Record<string, string> = {
  Legendary: "bg-purple-100 text-purple-700 border-purple-200",
  Diamond: "bg-cyan-100 text-cyan-700 border-cyan-200",
  Platinum: "bg-slate-100 text-slate-600 border-slate-200",
  Gold: "bg-amber-100 text-amber-700 border-amber-200",
  Silver: "bg-gray-100 text-gray-600 border-gray-200",
  Bronze: "bg-orange-100 text-orange-700 border-orange-200",
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function GoldCoinsTransfer() {
  const [step, setStep] = useState<Step>("form");
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<AppUser | null>(null);
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [activeTab, setActiveTab] = useState<"search" | "recent">("search");

  const myCoins = 12400;

  const filteredUsers = APP_USERS.filter(u =>
    u.displayName.toLowerCase().includes(search.toLowerCase()) ||
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  const parsedAmount = parseInt(amount, 10);
  const isFormValid = selectedUser && parsedAmount > 0 && parsedAmount <= myCoins && !isNaN(parsedAmount);

  function handleSend() {
    setStep("success");
    toast.success(`🪙 ${parsedAmount.toLocaleString()} GoldCoins sent to ${selectedUser?.displayName}!`, {
      description: reason ? `"${reason}"` : "Transfer complete",
      duration: 5000,
    });
  }

  function handleReset() {
    setStep("form");
    setAmount("");
    setReason("");
    setSelectedUser(null);
    setSearch("");
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
          <span className="text-xl">🪙</span>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-foreground" style={{ fontFamily: "'DM Serif Display', serif" }}>
            Send GoldCoins
          </h2>
          <p className="text-sm text-muted-foreground">Gift coins to friends and fellow investors</p>
        </div>
        <div className="ml-auto text-right">
          <p className="text-xs text-muted-foreground">Your Balance</p>
          <p className="text-lg font-bold text-amber-600">🪙 {myCoins.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">GoldCoins</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* ── FORM STEP ── */}
        {step === "form" && (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-5"
          >
            {/* Recipient Tabs */}
            <div>
              <div className="flex gap-2 p-1 bg-muted rounded-xl mb-3">
                <button
                  onClick={() => setActiveTab("search")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeTab === "search" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Search className="w-3.5 h-3.5" />
                  Find User
                </button>
                <button
                  onClick={() => setActiveTab("recent")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeTab === "recent" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <History className="w-3.5 h-3.5" />
                  Recent
                </button>
              </div>

              {activeTab === "search" ? (
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search by name or @username…"
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition-all"
                    />
                  </div>
                  <div className="border border-border rounded-xl overflow-hidden divide-y divide-border max-h-64 overflow-y-auto">
                    {filteredUsers.map(user => (
                      <button
                        key={user.id}
                        onClick={() => setSelectedUser(user)}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                          selectedUser?.id === user.id
                            ? "bg-amber-50 border-l-2 border-l-amber-400"
                            : "hover:bg-muted/60"
                        }`}
                      >
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {user.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-sm font-medium text-foreground">{user.displayName}</span>
                            {user.verified && <CheckCircle2 className="w-3.5 h-3.5 text-teal-500 flex-shrink-0" />}
                            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${TIER_COLORS[user.tier] ?? ""}`}>
                              {user.tier}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>@{user.username}</span>
                            {user.mutualFriends > 0 && (
                              <span className="flex items-center gap-0.5">
                                <Users className="w-3 h-3" /> {user.mutualFriends} mutual
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-xs text-amber-600 font-medium">🪙 {user.coins.toLocaleString()}</p>
                          {selectedUser?.id === user.id && (
                            <CheckCircle2 className="w-4 h-4 text-amber-500 ml-auto mt-1" />
                          )}
                        </div>
                      </button>
                    ))}
                    {filteredUsers.length === 0 && (
                      <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                        No users found for "{search}"
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {RECENT_TRANSFERS.map(tx => (
                    <button
                      key={tx.id}
                      onClick={() => {
                        const user = APP_USERS.find(u => u.displayName === tx.to);
                        if (user) setSelectedUser(user);
                        setActiveTab("search");
                      }}
                      className="w-full flex items-center gap-3 p-3 bg-muted/40 rounded-xl hover:bg-muted/70 transition-colors text-left"
                    >
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {tx.toAvatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{tx.to}</p>
                        <p className="text-xs text-muted-foreground truncate">{tx.reason} · {tx.time}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-semibold text-amber-600">−🪙 {tx.amount}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Selected User Banner */}
            {selectedUser && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 p-3 bg-teal-50 border border-teal-200 rounded-xl"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center text-white text-xs font-bold">
                  {selectedUser.avatar}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-teal-800">Sending to {selectedUser.displayName}</p>
                  <p className="text-xs text-teal-600">@{selectedUser.username}</p>
                </div>
                <button onClick={() => setSelectedUser(null)} className="text-teal-500 hover:text-teal-700 text-xs font-medium">
                  Change
                </button>
              </motion.div>
            )}

            {/* Amount */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Amount</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg">🪙</span>
                <input
                  type="number"
                  placeholder="0"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  min="1"
                  max={myCoins}
                  className="w-full pl-9 pr-4 py-2.5 bg-background border border-border rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition-all"
                />
              </div>
              {/* Quick amounts */}
              <div className="flex gap-2 flex-wrap">
                {QUICK_AMOUNTS.map(q => (
                  <button
                    key={q}
                    onClick={() => setAmount(q.toString())}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
                      parseInt(amount) === q
                        ? "bg-amber-400 border-amber-400 text-amber-900"
                        : "bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100"
                    }`}
                  >
                    🪙 {q}
                  </button>
                ))}
              </div>
              {parsedAmount > myCoins && (
                <p className="flex items-center gap-1.5 text-xs text-red-500">
                  <AlertCircle className="w-3.5 h-3.5" /> Not enough GoldCoins
                </p>
              )}
              {parsedAmount > 0 && parsedAmount <= myCoins && (
                <p className="text-xs text-muted-foreground">
                  Remaining balance: 🪙 {(myCoins - parsedAmount).toLocaleString()} GoldCoins
                </p>
              )}
            </div>

            {/* Reason */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Message <span className="text-muted-foreground font-normal">(optional)</span></label>
              <input
                type="text"
                placeholder="Add a message…"
                value={reason}
                onChange={e => setReason(e.target.value)}
                maxLength={80}
                className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition-all"
              />
              <div className="flex gap-2 flex-wrap">
                {["🎉 Congrats!", "💰 Nice trade!", "🏆 Well done!", "🤝 Thanks!", "🎯 Challenge win!"].map(msg => (
                  <button
                    key={msg}
                    onClick={() => setReason(msg)}
                    className="text-xs px-2.5 py-1 rounded-lg bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors border border-border"
                  >
                    {msg}
                  </button>
                ))}
              </div>
            </div>

            {/* Send Button */}
            <button
              disabled={!isFormValid}
              onClick={() => setStep("confirm")}
              className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: isFormValid
                  ? "linear-gradient(135deg, oklch(0.78 0.18 65), oklch(0.68 0.16 50))"
                  : undefined,
                backgroundColor: isFormValid ? undefined : "oklch(0.88 0.01 80)",
                color: isFormValid ? "oklch(0.18 0.04 220)" : "oklch(0.52 0.03 220)",
                boxShadow: isFormValid ? "0 2px 12px oklch(0.68 0.16 50 / 0.35)" : undefined,
              }}
            >
              <ArrowRight className="w-4 h-4" />
              Review Transfer
            </button>
          </motion.div>
        )}

        {/* ── CONFIRM STEP ── */}
        {step === "confirm" && (
          <motion.div
            key="confirm"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-5"
          >
            <div className="p-5 bg-amber-50 border border-amber-200 rounded-2xl space-y-4">
              <h3 className="text-base font-semibold text-foreground">Confirm Transfer</h3>
              <div className="flex items-center justify-center gap-4 py-4">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center text-white font-bold mx-auto mb-1">
                    You
                  </div>
                  <p className="text-xs text-muted-foreground">You</p>
                </div>
                <div className="flex-1 flex flex-col items-center">
                  <div className="flex items-center gap-1 text-amber-600 font-bold text-lg">
                    🪙 {parsedAmount.toLocaleString()}
                  </div>
                  <div className="w-full h-0.5 bg-gradient-to-r from-amber-300 to-amber-500 my-1 rounded-full" />
                  <ArrowRight className="w-4 h-4 text-amber-500" />
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center text-white font-bold mx-auto mb-1">
                    {selectedUser?.avatar}
                  </div>
                  <p className="text-xs text-muted-foreground">{selectedUser?.displayName}</p>
                </div>
              </div>
              {reason && (
                <div className="p-3 bg-white rounded-xl border border-amber-200 text-sm text-center italic text-muted-foreground">
                  "{reason}"
                </div>
              )}
              <div className="flex items-center gap-2 p-3 bg-white rounded-xl border border-amber-200">
                <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <p className="text-xs text-muted-foreground">
                  GoldCoin transfers are instant and free. The recipient will be notified immediately.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setStep("form")}
                className="flex-1 py-3 rounded-xl font-semibold text-sm border border-border text-foreground hover:bg-muted transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleSend}
                className="flex-1 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200"
                style={{
                  background: "linear-gradient(135deg, oklch(0.78 0.18 65), oklch(0.68 0.16 50))",
                  color: "oklch(0.18 0.04 220)",
                  boxShadow: "0 2px 12px oklch(0.68 0.16 50 / 0.35)",
                }}
              >
                <Zap className="w-4 h-4" />
                Send Now
              </button>
            </div>
          </motion.div>
        )}

        {/* ── SUCCESS STEP ── */}
        {step === "success" && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="text-center space-y-5 py-4"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
              className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center mx-auto text-4xl"
            >
              🪙
            </motion.div>
            <div>
              <h3 className="text-xl font-semibold text-foreground" style={{ fontFamily: "'DM Serif Display', serif" }}>
                Coins Sent!
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                🪙 {parsedAmount.toLocaleString()} GoldCoins sent to {selectedUser?.displayName}
              </p>
            </div>
            <div className="p-4 bg-muted/50 rounded-xl text-left space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">New Balance</span>
                <span className="font-semibold text-amber-600">🪙 {(myCoins - parsedAmount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <span className="flex items-center gap-1 text-teal-600 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Delivered instantly
                </span>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleReset}
                className="flex-1 py-3 rounded-xl font-semibold text-sm border border-border text-foreground hover:bg-muted transition-colors"
              >
                Send More
              </button>
              <button
                onClick={() => toast.info("Opening Social Hub…")}
                className="flex-1 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 border border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100 transition-colors"
              >
                <Gift className="w-4 h-4" />
                View Friends
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
