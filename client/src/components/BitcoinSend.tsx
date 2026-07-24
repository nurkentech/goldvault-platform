/**
 * BitcoinSend Component
 * Design: Warm cream/champagne background, deep teal-navy primary, warm gold accents
 * Allows sending BTC to platform users or any external Bitcoin address
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Bitcoin,
  Search,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  Clock,
  Shield,
  Zap,
  Users,
  Wallet,
  ChevronRight,
  X,
  QrCode,
  Camera,
  BookOpen,
} from "lucide-react";
import QrScanner from "@/components/QrScanner";
import AddressBook from "@/components/AddressBook";

// ─── Types ────────────────────────────────────────────────────────────────────

type SendMode = "platform" | "external";
type Step = "form" | "confirm" | "success";

interface PlatformUser {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  btcAddress: string;
  verified: boolean;
  tier: string;
}

interface Transaction {
  id: string;
  to: string;
  toLabel: string;
  amount: string;
  usdValue: string;
  fee: string;
  txHash: string;
  status: "confirmed" | "pending";
  time: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const PLATFORM_USERS: PlatformUser[] = [
  { id: "1", username: "alexchen", displayName: "Alex Chen", avatar: "AC", btcAddress: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh", verified: true, tier: "Platinum" },
  { id: "2", username: "mariasantos", displayName: "Maria Santos", avatar: "MS", btcAddress: "bc1q9h6zf5hpkxfmq4mxs8x3kzqzjvw8n2t7h3d4p", verified: true, tier: "Gold" },
  { id: "3", username: "jameswright", displayName: "James Wright", avatar: "JW", btcAddress: "bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq", verified: false, tier: "Silver" },
  { id: "4", username: "priyapatel", displayName: "Priya Patel", avatar: "PP", btcAddress: "bc1qc7slrfxkknqcq57x3fkpkxmj7jk5y6k3xzp4p", verified: true, tier: "Diamond" },
  { id: "5", username: "davidkim", displayName: "David Kim", avatar: "DK", btcAddress: "bc1q6h7r3x9k2m4n8p5q7w1e0t6y9u3i5o2a4s6d8", verified: false, tier: "Bronze" },
  { id: "6", username: "sofiarossi", displayName: "Sofia Rossi", avatar: "SR", btcAddress: "bc1qd8kz3m7n4p6q9r2s5t8v1w4x7y0z3a6b9c2e5", verified: true, tier: "Gold" },
];

const RECENT_TXS: Transaction[] = [
  { id: "1", to: "bc1qxy2...wlh", toLabel: "Alex Chen", amount: "0.00250000", usdValue: "$168.55", fee: "$1.20", txHash: "a1b2c3d4e5f6...", status: "confirmed", time: "2h ago" },
  { id: "2", to: "bc1q9h6...4p", toLabel: "External", amount: "0.01000000", usdValue: "$674.20", fee: "$2.10", txHash: "f6e5d4c3b2a1...", status: "confirmed", time: "1d ago" },
  { id: "3", to: "bc1qar0...mdq", toLabel: "James Wright", amount: "0.00500000", usdValue: "$337.10", fee: "$1.50", txHash: "9c8b7a6d5e4f...", status: "pending", time: "2d ago" },
];

const BTC_PRICE = 67420;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isValidBtcAddress(addr: string): boolean {
  return /^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}$/.test(addr.trim());
}

function btcToUsd(btc: string): string {
  const n = parseFloat(btc);
  if (isNaN(n)) return "$0.00";
  return `$${(n * BTC_PRICE).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function estimateFee(btc: string): string {
  const n = parseFloat(btc);
  if (isNaN(n) || n <= 0) return "$0.00";
  const fee = Math.max(0.8, n * BTC_PRICE * 0.0015);
  return `$${fee.toFixed(2)}`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function TierBadge({ tier }: { tier: string }) {
  const colors: Record<string, string> = {
    Diamond: "bg-cyan-100 text-cyan-700 border-cyan-200",
    Platinum: "bg-slate-100 text-slate-600 border-slate-200",
    Gold: "bg-amber-100 text-amber-700 border-amber-200",
    Silver: "bg-gray-100 text-gray-600 border-gray-200",
    Bronze: "bg-orange-100 text-orange-700 border-orange-200",
  };
  return (
    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${colors[tier] ?? "bg-gray-100 text-gray-600 border-gray-200"}`}>
      {tier}
    </span>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function BitcoinSend() {
  const [mode, setMode] = useState<SendMode>("platform");
  const [step, setStep] = useState<Step>("form");
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<PlatformUser | null>(null);
  const [externalAddress, setExternalAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [addressError, setAddressError] = useState("");
  const [showScanner, setShowScanner] = useState(false);
  const [showAddressBook, setShowAddressBook] = useState(false);

  const btcBalance = 0.14285;
  const filteredUsers = PLATFORM_USERS.filter(u =>
    u.displayName.toLowerCase().includes(search.toLowerCase()) ||
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  const recipient = mode === "platform" ? selectedUser?.displayName : (externalAddress ? `${externalAddress.slice(0, 8)}...${externalAddress.slice(-6)}` : "");
  const recipientAddress = mode === "platform" ? selectedUser?.btcAddress ?? "" : externalAddress;
  const usdValue = btcToUsd(amount);
  const fee = estimateFee(amount);
  const isFormValid = amount && parseFloat(amount) > 0 && parseFloat(amount) <= btcBalance &&
    (mode === "platform" ? !!selectedUser : isValidBtcAddress(externalAddress));

  function handleAddressChange(val: string) {
    setExternalAddress(val);
    if (val && !isValidBtcAddress(val)) {
      setAddressError("Please enter a valid Bitcoin address (starts with bc1, 1, or 3)");
    } else {
      setAddressError("");
    }
  }

  function handleSend() {
    setStep("success");
    toast.success(`₿ ${amount} BTC sent to ${recipient}!`, {
      description: `Transaction submitted to the Bitcoin network`,
      duration: 5000,
    });
  }

  function handleReset() {
    setStep("form");
    setAmount("");
    setNote("");
    setSelectedUser(null);
    setExternalAddress("");
    setSearch("");
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
          <Bitcoin className="w-5 h-5 text-amber-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-foreground" style={{ fontFamily: "'DM Serif Display', serif" }}>
            Send Bitcoin
          </h2>
          <p className="text-sm text-muted-foreground">Transfer BTC instantly to anyone, anywhere</p>
        </div>
        <div className="ml-auto text-right">
          <p className="text-xs text-muted-foreground">Available Balance</p>
          <p className="text-lg font-bold text-amber-600">₿ {btcBalance.toFixed(8)}</p>
          <p className="text-xs text-muted-foreground">{btcToUsd(btcBalance.toString())}</p>
        </div>
      </div>

      {/* Mode Toggle */}
      <div className="flex gap-2 p-1 bg-muted rounded-xl">
        <button
          onClick={() => { setMode("platform"); setStep("form"); }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
            mode === "platform"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Users className="w-4 h-4" />
          GoldVaults Users
        </button>
        <button
          onClick={() => { setMode("external"); setStep("form"); }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
            mode === "external"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Wallet className="w-4 h-4" />
          External Address
        </button>
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
            {/* Recipient */}
            {mode === "platform" ? (
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Send to GoldVaults User</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search by name or username…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition-all"
                  />
                </div>
                {/* User list */}
                <div className="border border-border rounded-xl overflow-hidden divide-y divide-border">
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
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-medium text-foreground">{user.displayName}</span>
                          {user.verified && <CheckCircle2 className="w-3.5 h-3.5 text-teal-500 flex-shrink-0" />}
                          <TierBadge tier={user.tier} />
                        </div>
                        <p className="text-xs text-muted-foreground">@{user.username}</p>
                      </div>
                      {selectedUser?.id === user.id && (
                        <CheckCircle2 className="w-5 h-5 text-amber-500 flex-shrink-0" />
                      )}
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
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground">Bitcoin Address</label>
                  <button
                    type="button"
                    onClick={() => setShowAddressBook(true)}
                    className="flex items-center gap-1.5 text-xs font-medium text-amber-400 hover:text-amber-300 transition-colors"
                  >
                    <BookOpen className="w-3.5 h-3.5" /> Address Book
                  </button>
                </div>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="bc1q… or 1… or 3…"
                      value={externalAddress}
                      onChange={e => handleAddressChange(e.target.value)}
                      className={`w-full px-4 py-2.5 bg-background border rounded-xl text-sm font-mono focus:outline-none focus:ring-2 transition-all ${
                        addressError
                          ? "border-red-400 focus:ring-red-400/30"
                          : externalAddress && !addressError
                          ? "border-teal-400 focus:ring-teal-400/30"
                          : "border-border focus:ring-amber-400/40 focus:border-amber-400"
                      }`}
                    />
                    {externalAddress && !addressError && (
                      <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-teal-500" />
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowScanner(true)}
                    title="Scan QR code"
                    className="flex-shrink-0 flex items-center justify-center w-11 h-11 rounded-xl border-2 border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-600 hover:text-amber-700 transition-all duration-200"
                    style={{ boxShadow: "0 1px 4px oklch(0.68 0.16 50 / 0.2)" }}
                  >
                    <Camera className="w-5 h-5" />
                  </button>
                </div>
                {addressError && (
                  <p className="flex items-center gap-1.5 text-xs text-red-500">
                    <AlertCircle className="w-3.5 h-3.5" /> {addressError}
                  </p>
                )}
                {externalAddress && !addressError && (
                  <p className="flex items-center gap-1.5 text-xs text-teal-600">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Valid Bitcoin address
                  </p>
                )}
                <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <QrCode className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <p className="text-xs text-amber-700">Paste a Bitcoin address or tap the <Camera className="w-3 h-3 inline mx-0.5" /> button to scan a QR code with your camera.</p>
                </div>
              </div>
            )}

            {/* Amount */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Amount (BTC)</label>
              <div className="relative">
                <Bitcoin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500" />
                <input
                  type="number"
                  placeholder="0.00000000"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  step="0.00000001"
                  min="0"
                  max={btcBalance}
                  className="w-full pl-9 pr-24 py-2.5 bg-background border border-border rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition-all"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1.5">
                  {["25%", "50%", "Max"].map(pct => (
                    <button
                      key={pct}
                      onClick={() => {
                        const mult = pct === "Max" ? 1 : pct === "50%" ? 0.5 : 0.25;
                        setAmount((btcBalance * mult).toFixed(8));
                      }}
                      className="text-[10px] font-semibold px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded-md hover:bg-amber-200 transition-colors"
                    >
                      {pct}
                    </button>
                  ))}
                </div>
              </div>
              {amount && (
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>≈ {usdValue} USD</span>
                  <span>Network fee: {fee}</span>
                </div>
              )}
              {amount && parseFloat(amount) > btcBalance && (
                <p className="flex items-center gap-1.5 text-xs text-red-500">
                  <AlertCircle className="w-3.5 h-3.5" /> Insufficient balance
                </p>
              )}
            </div>

            {/* Note */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Note <span className="text-muted-foreground font-normal">(optional)</span></label>
              <input
                type="text"
                placeholder="What's this for?"
                value={note}
                onChange={e => setNote(e.target.value)}
                maxLength={100}
                className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition-all"
              />
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
              Review Transaction
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
              <h3 className="text-base font-semibold text-foreground">Confirm Transaction</h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sending to</span>
                  <span className="font-medium text-foreground">{recipient}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Address</span>
                  <span className="font-mono text-xs text-foreground">
                    {recipientAddress.slice(0, 10)}…{recipientAddress.slice(-8)}
                  </span>
                </div>
                <div className="border-t border-amber-200 pt-3 flex justify-between">
                  <span className="text-muted-foreground">Amount</span>
                  <div className="text-right">
                    <p className="font-bold text-amber-600">₿ {parseFloat(amount).toFixed(8)}</p>
                    <p className="text-xs text-muted-foreground">{usdValue}</p>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Network Fee</span>
                  <span className="text-foreground">{fee}</span>
                </div>
                {note && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Note</span>
                    <span className="text-foreground italic">"{note}"</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 p-3 bg-white rounded-xl border border-amber-200">
                <Shield className="w-4 h-4 text-teal-600 flex-shrink-0" />
                <p className="text-xs text-muted-foreground">
                  This transaction is secured by MPC multi-signature and cannot be reversed once confirmed.
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
                Confirm & Send
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
              className="w-20 h-20 rounded-full bg-teal-100 flex items-center justify-center mx-auto"
            >
              <CheckCircle2 className="w-10 h-10 text-teal-600" />
            </motion.div>
            <div>
              <h3 className="text-xl font-semibold text-foreground" style={{ fontFamily: "'DM Serif Display', serif" }}>
                Transaction Sent!
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                ₿ {parseFloat(amount).toFixed(8)} BTC sent to {recipient}
              </p>
            </div>
            <div className="p-4 bg-muted/50 rounded-xl text-left space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Transaction ID</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-xs">a1b2c3d4…e5f6</span>
                  <button onClick={() => { navigator.clipboard.writeText("a1b2c3d4e5f6"); toast.success("Copied!"); }}>
                    <Copy className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
                  </button>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <span className="flex items-center gap-1 text-amber-600 font-medium">
                  <Clock className="w-3.5 h-3.5" /> Pending confirmation
                </span>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleReset}
                className="flex-1 py-3 rounded-xl font-semibold text-sm border border-border text-foreground hover:bg-muted transition-colors"
              >
                Send Another
              </button>
              <button
                onClick={() => toast.info("Block explorer opening…")}
                className="flex-1 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 border border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                View on Explorer
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recent Transactions */}
      {step === "form" && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground">Recent Transactions</h3>
          <div className="space-y-2">
            {RECENT_TXS.map(tx => (
              <div key={tx.id} className="flex items-center gap-3 p-3 bg-muted/40 rounded-xl hover:bg-muted/60 transition-colors">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  tx.status === "confirmed" ? "bg-teal-100" : "bg-amber-100"
                }`}>
                  {tx.status === "confirmed"
                    ? <CheckCircle2 className="w-4 h-4 text-teal-600" />
                    : <Clock className="w-4 h-4 text-amber-600" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">To {tx.toLabel}</p>
                  <p className="text-xs text-muted-foreground">{tx.to} · {tx.time}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-semibold text-amber-600">−₿ {tx.amount}</p>
                  <p className="text-xs text-muted-foreground">{tx.usdValue}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Address Book Modal */}
      {showAddressBook && (
        <AddressBook
          currentAddress={externalAddress}
          onSelect={(address, label) => {
            setExternalAddress(address);
            setAddressError("");
            toast.success(`Selected: ${label}`, { description: `${address.slice(0, 12)}…${address.slice(-8)}` });
          }}
          onClose={() => setShowAddressBook(false)}
        />
      )}

      {/* QR Code Scanner Modal */}
      {showScanner && (
        <QrScanner
          onScan={(address) => {
            setExternalAddress(address);
            setAddressError(isValidBtcAddress(address) ? "" : "Scanned value does not appear to be a valid Bitcoin address");
            setShowScanner(false);
            if (isValidBtcAddress(address)) {
              toast.success("Bitcoin address captured from QR code!", {
                description: `${address.slice(0, 12)}…${address.slice(-8)}`,
              });
            }
          }}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  );
}
