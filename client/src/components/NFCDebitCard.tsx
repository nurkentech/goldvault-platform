/**
 * NFCDebitCard Component
 * Design: Dark navy & gold — GoldVaults premium theme
 * Features:
 *  - Virtual GoldVaults Debit Card (Visa/Mastercard) with NFC tap-to-pay simulation
 *  - Card flip animation (front/back)
 *  - Tap-to-pay flow with NFC pulse animation
 *  - Card management: freeze/unfreeze, set spending limits, PIN change
 *  - Transaction history with merchant icons
 *  - Add new card / link bank account
 *  - Apple Pay / Google Pay integration indicators
 */

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  CreditCard,
  Wifi,
  Shield,
  Lock,
  Unlock,
  Settings,
  Plus,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  Zap,
  DollarSign,
  TrendingUp,
  Eye,
  EyeOff,
  RefreshCw,
  ArrowUpRight,
  ArrowDownLeft,
  ShoppingBag,
  Coffee,
  Fuel,
  Utensils,
  Building,
  Globe,
  X,
  Nfc,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface DebitCard {
  id: string;
  nickname: string;
  last4: string;
  network: "visa" | "mastercard";
  expiry: string;
  cardholderName: string;
  frozen: boolean;
  nfcEnabled: boolean;
  spendingLimit: number;
  spentThisMonth: number;
  balance: number;
  color: "gold" | "platinum" | "obsidian";
}

interface CardTransaction {
  id: string;
  merchant: string;
  category: "shopping" | "food" | "fuel" | "travel" | "atm" | "transfer" | "other";
  amount: number;
  currency: string;
  date: string;
  status: "completed" | "pending" | "declined";
  nfc: boolean;
  cardLast4: string;
}

type NfcStep = "idle" | "searching" | "detected" | "processing" | "success" | "error";

// ─── Mock Data ────────────────────────────────────────────────────────────────

const CARDS: DebitCard[] = [
  {
    id: "1",
    nickname: "Gold Elite Card",
    last4: "4291",
    network: "visa",
    expiry: "09/28",
    cardholderName: "ALEX JOHNSON",
    frozen: false,
    nfcEnabled: true,
    spendingLimit: 5000,
    spentThisMonth: 1842.5,
    balance: 34782.45,
    color: "gold",
  },
  {
    id: "2",
    nickname: "Platinum Reserve",
    last4: "8847",
    network: "mastercard",
    expiry: "03/27",
    cardholderName: "ALEX JOHNSON",
    frozen: false,
    nfcEnabled: true,
    spendingLimit: 10000,
    spentThisMonth: 3210.0,
    balance: 12500.0,
    color: "platinum",
  },
];

const TRANSACTIONS: CardTransaction[] = [
  { id: "1", merchant: "Whole Foods Market", category: "shopping", amount: 87.43, currency: "USD", date: "Today, 2:14 PM", status: "completed", nfc: true, cardLast4: "4291" },
  { id: "2", merchant: "Starbucks Reserve", category: "food", amount: 12.50, currency: "USD", date: "Today, 9:05 AM", status: "completed", nfc: true, cardLast4: "4291" },
  { id: "3", merchant: "Shell Gas Station", category: "fuel", amount: 65.20, currency: "USD", date: "Yesterday, 6:30 PM", status: "completed", nfc: false, cardLast4: "8847" },
  { id: "4", merchant: "Amazon Prime", category: "shopping", amount: 139.99, currency: "USD", date: "Yesterday, 11:22 AM", status: "completed", nfc: false, cardLast4: "4291" },
  { id: "5", merchant: "Delta Airlines", category: "travel", amount: 420.00, currency: "USD", date: "Jun 24, 3:45 PM", status: "completed", nfc: false, cardLast4: "8847" },
  { id: "6", merchant: "Chipotle", category: "food", amount: 18.75, currency: "USD", date: "Jun 24, 12:10 PM", status: "completed", nfc: true, cardLast4: "4291" },
  { id: "7", merchant: "ATM Withdrawal", category: "atm", amount: 200.00, currency: "USD", date: "Jun 23, 4:00 PM", status: "completed", nfc: false, cardLast4: "4291" },
  { id: "8", merchant: "Netflix", category: "other", amount: 15.99, currency: "USD", date: "Jun 22, 12:00 AM", status: "completed", nfc: false, cardLast4: "8847" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function categoryIcon(cat: CardTransaction["category"]) {
  const cls = "w-4 h-4";
  switch (cat) {
    case "shopping": return <ShoppingBag className={cls} />;
    case "food": return <Coffee className={cls} />;
    case "fuel": return <Fuel className={cls} />;
    case "travel": return <Globe className={cls} />;
    case "atm": return <Building className={cls} />;
    case "transfer": return <ArrowUpRight className={cls} />;
    default: return <DollarSign className={cls} />;
  }
}

function categoryColor(cat: CardTransaction["category"]) {
  switch (cat) {
    case "shopping": return "bg-purple-500/20 text-purple-400";
    case "food": return "bg-amber-500/20 text-amber-400";
    case "fuel": return "bg-red-500/20 text-red-400";
    case "travel": return "bg-blue-500/20 text-blue-400";
    case "atm": return "bg-slate-500/20 text-slate-400";
    case "transfer": return "bg-emerald-500/20 text-emerald-400";
    default: return "bg-slate-500/20 text-slate-400";
  }
}

const CARD_GRADIENTS = {
  gold: "linear-gradient(135deg, oklch(0.22 0.04 50) 0%, oklch(0.30 0.08 55) 40%, oklch(0.25 0.06 45) 100%)",
  platinum: "linear-gradient(135deg, oklch(0.22 0.02 250) 0%, oklch(0.32 0.04 255) 50%, oklch(0.26 0.03 245) 100%)",
  obsidian: "linear-gradient(135deg, oklch(0.10 0.01 255) 0%, oklch(0.18 0.02 250) 50%, oklch(0.12 0.015 245) 100%)",
};

// ─── Card Visual ──────────────────────────────────────────────────────────────

function CardVisual({ card, flipped, showDetails }: { card: DebitCard; flipped: boolean; showDetails: boolean }) {
  return (
    <div className="relative w-full" style={{ perspective: "1000px" }}>
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.55, ease: [0.23, 1, 0.32, 1] }}
        style={{ transformStyle: "preserve-3d" }}
        className="relative w-full"
        // 85.6mm × 53.98mm standard card ratio
        // We use aspect-[1.586/1]
      >
        {/* Front */}
        <div
          className="w-full rounded-2xl p-5 relative overflow-hidden select-none"
          style={{
            background: CARD_GRADIENTS[card.color],
            aspectRatio: "1.586 / 1",
            backfaceVisibility: "hidden",
            boxShadow: "0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.08)",
          }}
        >
          {/* Holographic shimmer overlay */}
          <div className="absolute inset-0 opacity-20"
            style={{ background: "linear-gradient(135deg, transparent 30%, rgba(255,255,255,0.15) 50%, transparent 70%)" }}
          />
          {/* Chip */}
          <div className="absolute top-5 left-5 w-10 h-8 rounded-md border border-amber-400/40"
            style={{ background: "linear-gradient(135deg, oklch(0.78 0.18 65 / 0.6), oklch(0.68 0.16 50 / 0.4))" }}
          >
            <div className="absolute inset-1 grid grid-cols-2 gap-0.5 opacity-60">
              {[...Array(4)].map((_, i) => <div key={i} className="bg-amber-300/40 rounded-sm" />)}
            </div>
          </div>
          {/* NFC icon */}
          {card.nfcEnabled && (
            <div className="absolute top-5 right-5">
              <Wifi className="w-6 h-6 text-white/60 rotate-90" />
            </div>
          )}
          {/* Frozen overlay */}
          {card.frozen && (
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center rounded-2xl">
              <div className="flex flex-col items-center gap-1">
                <Lock className="w-8 h-8 text-blue-400" />
                <span className="text-xs font-semibold text-blue-300">CARD FROZEN</span>
              </div>
            </div>
          )}
          {/* Card number */}
          <div className="absolute bottom-14 left-5 right-5">
            <p className="text-white/80 text-sm font-mono tracking-widest">
              {showDetails ? `4291 8847 2019 ${card.last4}` : `•••• •••• •••• ${card.last4}`}
            </p>
          </div>
          {/* Bottom row */}
          <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between">
            <div>
              <p className="text-white/50 text-[9px] uppercase tracking-wider mb-0.5">Card Holder</p>
              <p className="text-white text-xs font-semibold tracking-wide">{card.cardholderName}</p>
            </div>
            <div className="text-right">
              <p className="text-white/50 text-[9px] uppercase tracking-wider mb-0.5">Expires</p>
              <p className="text-white text-xs font-semibold">{card.expiry}</p>
            </div>
            {/* Network logo */}
            <div className="flex items-center">
              {card.network === "visa" ? (
                <span className="text-white font-bold italic text-lg tracking-tight" style={{ fontFamily: "serif" }}>VISA</span>
              ) : (
                <div className="flex">
                  <div className="w-7 h-7 rounded-full bg-red-500/80" />
                  <div className="w-7 h-7 rounded-full bg-amber-400/80 -ml-3" />
                </div>
              )}
            </div>
          </div>
          {/* GoldVaults branding */}
          <div className="absolute top-14 left-5">
            <p className="text-amber-400/80 text-[10px] font-bold tracking-widest uppercase">GoldVaults</p>
          </div>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 w-full rounded-2xl overflow-hidden"
          style={{
            background: CARD_GRADIENTS[card.color],
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
          }}
        >
          {/* Magnetic stripe */}
          <div className="w-full h-10 bg-slate-900/80 mt-8" />
          {/* Signature strip */}
          <div className="mx-5 mt-4 flex items-center gap-3">
            <div className="flex-1 h-8 bg-white/90 rounded flex items-center px-2">
              <div className="flex gap-0.5">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="w-1 h-5 rounded-sm opacity-30"
                    style={{ background: i % 3 === 0 ? "#1a1a2e" : i % 3 === 1 ? "#c9a227" : "#2d3a6b" }}
                  />
                ))}
              </div>
            </div>
            <div className="w-16 h-8 bg-white/10 rounded border border-white/20 flex items-center justify-center">
              <span className="text-white/70 text-xs font-mono">{showDetails ? "847" : "•••"}</span>
            </div>
          </div>
          <p className="text-center text-white/40 text-[9px] mt-3 px-5">
            This card is property of GoldVaults Financial Services. If found, please return to nearest branch.
          </p>
          <div className="absolute bottom-4 left-5 right-5 flex items-center justify-between">
            <span className="text-amber-400/60 text-[10px] font-bold tracking-widest uppercase">GoldVaults</span>
            {card.network === "visa" ? (
              <span className="text-white/60 font-bold italic text-sm" style={{ fontFamily: "serif" }}>VISA</span>
            ) : (
              <div className="flex">
                <div className="w-5 h-5 rounded-full bg-red-500/60" />
                <div className="w-5 h-5 rounded-full bg-amber-400/60 -ml-2" />
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── NFC Tap Modal ────────────────────────────────────────────────────────────

function NfcTapModal({ card, onClose }: { card: DebitCard; onClose: () => void }) {
  const [step, setStep] = useState<NfcStep>("idle");
  const [amount, setAmount] = useState("");
  const [merchant, setMerchant] = useState("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function startTap() {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    if (!merchant.trim()) {
      toast.error("Please enter a merchant name");
      return;
    }
    setStep("searching");
    timerRef.current = setTimeout(() => {
      setStep("detected");
      timerRef.current = setTimeout(() => {
        setStep("processing");
        timerRef.current = setTimeout(() => {
          setStep("success");
          toast.success(`Payment of $${parseFloat(amount).toFixed(2)} to ${merchant} approved!`, {
            description: "NFC tap payment processed via GoldVaults Debit",
          });
        }, 1800);
      }, 1200);
    }, 1500);
  }

  function reset() {
    if (timerRef.current) clearTimeout(timerRef.current);
    setStep("idle");
    setAmount("");
    setMerchant("");
  }

  const stepLabels: Record<NfcStep, string> = {
    idle: "Ready to tap",
    searching: "Searching for NFC terminal…",
    detected: "Terminal detected!",
    processing: "Processing payment…",
    success: "Payment approved!",
    error: "Payment failed",
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
        className="relative w-full max-w-sm bg-slate-900 border border-white/10 rounded-2xl overflow-hidden"
        style={{ boxShadow: "0 24px 80px rgba(0,0,0,0.6)" }}
      >
        <div className="h-1" style={{ background: "linear-gradient(90deg, oklch(0.78 0.18 65), oklch(0.68 0.16 50))" }} />
        <div className="p-5">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 flex items-center justify-center">
                <Nfc className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">NFC Tap to Pay</h3>
                <p className="text-xs text-slate-500">•••• {card.last4}</p>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-white hover:bg-white/10 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {step === "idle" && (
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Merchant / Store</label>
                <input value={merchant} onChange={e => setMerchant(e.target.value)}
                  placeholder="e.g. Whole Foods, Starbucks…"
                  className="w-full px-3 py-2.5 bg-slate-800/60 border border-slate-700/60 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/60 transition-all" />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Amount (USD)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                  <input value={amount} onChange={e => setAmount(e.target.value)} type="number" min="0.01" step="0.01"
                    placeholder="0.00"
                    className="w-full pl-7 pr-4 py-2.5 bg-slate-800/60 border border-slate-700/60 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/60 transition-all" />
                </div>
              </div>
              <button onClick={startTap}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm text-amber-900 transition-all active:scale-[0.97]"
                style={{ background: "linear-gradient(135deg, oklch(0.78 0.18 65), oklch(0.68 0.16 50))" }}
              >
                <Nfc className="w-4 h-4" /> Initiate NFC Tap
              </button>
            </div>
          )}

          {step !== "idle" && step !== "success" && step !== "error" && (
            <div className="py-8 flex flex-col items-center gap-5">
              {/* Animated NFC rings */}
              <div className="relative w-28 h-28 flex items-center justify-center">
                {[1, 2, 3].map(i => (
                  <motion.div key={i}
                    className="absolute rounded-full border-2 border-amber-400/40"
                    animate={{ scale: [1, 1.8 + i * 0.3], opacity: [0.6, 0] }}
                    transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.4, ease: "easeOut" }}
                    style={{ width: 40, height: 40 }}
                  />
                ))}
                <div className="w-14 h-14 rounded-full flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, oklch(0.78 0.18 65 / 0.3), oklch(0.68 0.16 50 / 0.2))", border: "2px solid oklch(0.78 0.18 65 / 0.5)" }}
                >
                  <Nfc className="w-7 h-7 text-amber-400" />
                </div>
              </div>
              <div className="text-center">
                <p className="text-white font-semibold text-sm">{stepLabels[step]}</p>
                {step === "processing" && amount && (
                  <p className="text-amber-400 text-lg font-bold mt-1">${parseFloat(amount).toFixed(2)}</p>
                )}
                <p className="text-slate-500 text-xs mt-1">
                  {step === "searching" ? "Hold your phone near the payment terminal" :
                   step === "detected" ? "Keep your device steady…" :
                   "Authorizing with GoldVaults secure network…"}
                </p>
              </div>
            </div>
          )}

          {step === "success" && (
            <div className="py-8 flex flex-col items-center gap-4">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}>
                <CheckCircle2 className="w-16 h-16 text-emerald-400" />
              </motion.div>
              <div className="text-center">
                <p className="text-white font-bold text-lg">Payment Approved!</p>
                <p className="text-emerald-400 text-2xl font-bold mt-1">${parseFloat(amount).toFixed(2)}</p>
                <p className="text-slate-400 text-sm mt-1">{merchant}</p>
                <p className="text-slate-500 text-xs mt-2">via NFC · Card •••• {card.last4}</p>
              </div>
              <div className="flex gap-2 w-full mt-2">
                <button onClick={reset}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-slate-300 bg-slate-700/60 hover:bg-slate-700 transition-all">
                  New Payment
                </button>
                <button onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-amber-900 transition-all"
                  style={{ background: "linear-gradient(135deg, oklch(0.78 0.18 65), oklch(0.68 0.16 50))" }}>
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function NFCDebitCard() {
  const [cards, setCards] = useState<DebitCard[]>(CARDS);
  const [activeCardIdx, setActiveCardIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showNfcModal, setShowNfcModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "transactions" | "settings">("overview");
  const [txFilter, setTxFilter] = useState<"all" | "nfc" | "online" | "atm">("all");

  const card = cards[activeCardIdx];

  function toggleFreeze() {
    setCards(prev => prev.map((c, i) => i === activeCardIdx ? { ...c, frozen: !c.frozen } : c));
    toast.success(card.frozen ? "Card unfrozen successfully" : "Card frozen — all transactions blocked");
  }

  function toggleNfc() {
    setCards(prev => prev.map((c, i) => i === activeCardIdx ? { ...c, nfcEnabled: !c.nfcEnabled } : c));
    toast.success(card.nfcEnabled ? "NFC payments disabled" : "NFC tap-to-pay enabled");
  }

  const filteredTxs = TRANSACTIONS.filter(tx => {
    if (txFilter === "nfc") return tx.nfc;
    if (txFilter === "online") return !tx.nfc && tx.category !== "atm";
    if (txFilter === "atm") return tx.category === "atm";
    return true;
  });

  const spendPct = Math.min((card.spentThisMonth / card.spendingLimit) * 100, 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white" style={{ fontFamily: "'DM Serif Display', serif" }}>
            Debit Cards & NFC Pay
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">Manage your GoldVaults debit cards and tap-to-pay</p>
        </div>
        <button
          onClick={() => toast.info("Card ordering coming soon — contact support to request a physical card")}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-amber-900 transition-all"
          style={{ background: "linear-gradient(135deg, oklch(0.78 0.18 65), oklch(0.68 0.16 50))" }}
        >
          <Plus className="w-3.5 h-3.5" /> Order New Card
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Card visual + quick actions */}
        <div className="space-y-4">
          {/* Card selector */}
          {cards.length > 1 && (
            <div className="flex gap-2">
              {cards.map((c, i) => (
                <button key={c.id} onClick={() => { setActiveCardIdx(i); setFlipped(false); }}
                  className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
                    i === activeCardIdx
                      ? "border-amber-500/50 bg-amber-500/10 text-amber-300"
                      : "border-slate-700/50 bg-slate-800/40 text-slate-400 hover:border-amber-500/30"
                  }`}>
                  <CreditCard className="w-3.5 h-3.5" />
                  <span className="truncate">{c.nickname}</span>
                  <span className="text-slate-500">•{c.last4}</span>
                </button>
              ))}
            </div>
          )}

          {/* Card visual */}
          <div className="relative cursor-pointer" onClick={() => setFlipped(f => !f)}>
            <CardVisual card={card} flipped={flipped} showDetails={showDetails} />
            <div className="absolute bottom-3 right-3 flex gap-1.5" onClick={e => e.stopPropagation()}>
              <button onClick={() => setShowDetails(s => !s)}
                className="w-7 h-7 rounded-lg bg-black/40 backdrop-blur-sm flex items-center justify-center text-white/60 hover:text-white transition-colors"
                title={showDetails ? "Hide details" : "Show details"}>
                {showDetails ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
            <p className="text-center text-slate-600 text-xs mt-2">Tap card to flip</p>
          </div>

          {/* Quick action buttons */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => {
                if (card.frozen) { toast.error("Unfreeze card first to use NFC"); return; }
                if (!card.nfcEnabled) { toast.error("Enable NFC in card settings first"); return; }
                setShowNfcModal(true);
              }}
              className="flex flex-col items-center gap-1.5 py-3 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/15 text-amber-400 transition-all"
            >
              <Nfc className="w-5 h-5" />
              <span className="text-xs font-medium">Tap to Pay</span>
            </button>
            <button onClick={toggleFreeze}
              className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border transition-all ${
                card.frozen
                  ? "border-blue-500/40 bg-blue-500/10 text-blue-400 hover:bg-blue-500/15"
                  : "border-slate-700/50 bg-slate-800/40 text-slate-400 hover:border-slate-600"
              }`}>
              {card.frozen ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
              <span className="text-xs font-medium">{card.frozen ? "Unfreeze" : "Freeze"}</span>
            </button>
            <button onClick={() => setActiveTab("settings")}
              className="flex flex-col items-center gap-1.5 py-3 rounded-xl border border-slate-700/50 bg-slate-800/40 text-slate-400 hover:border-slate-600 transition-all">
              <Settings className="w-5 h-5" />
              <span className="text-xs font-medium">Settings</span>
            </button>
          </div>

          {/* Spending meter */}
          <div className="p-4 rounded-xl border border-slate-700/50 bg-slate-800/40">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400">Monthly Spending</span>
              <span className="text-xs font-semibold text-white">
                ${card.spentThisMonth.toLocaleString()} / ${card.spendingLimit.toLocaleString()}
              </span>
            </div>
            <div className="w-full h-2 bg-slate-700/60 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${spendPct}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full rounded-full"
                style={{
                  background: spendPct > 80
                    ? "linear-gradient(90deg, oklch(0.65 0.22 25), oklch(0.60 0.20 20))"
                    : "linear-gradient(90deg, oklch(0.78 0.18 65), oklch(0.68 0.16 50))",
                }}
              />
            </div>
            <p className="text-xs text-slate-500 mt-1.5">
              ${(card.spendingLimit - card.spentThisMonth).toLocaleString()} remaining this month
            </p>
          </div>

          {/* Digital wallet integrations */}
          <div className="p-4 rounded-xl border border-slate-700/50 bg-slate-800/40">
            <p className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">Digital Wallets</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { name: "Apple Pay", icon: "🍎", status: "Connected" },
                { name: "Google Pay", icon: "🔵", status: "Connected" },
                { name: "Samsung Pay", icon: "📱", status: "Add" },
                { name: "PayPal", icon: "🅿️", status: "Add" },
              ].map(w => (
                <button key={w.name}
                  onClick={() => w.status === "Add"
                    ? toast.info(`${w.name} integration coming soon`)
                    : toast.success(`${w.name} is active and ready to use`)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs transition-all ${
                    w.status === "Connected"
                      ? "border-emerald-500/30 bg-emerald-500/8 text-emerald-400"
                      : "border-slate-700/40 bg-slate-800/30 text-slate-500 hover:border-slate-600"
                  }`}>
                  <span>{w.icon}</span>
                  <span className="font-medium">{w.name}</span>
                  <span className={`ml-auto text-[10px] ${w.status === "Connected" ? "text-emerald-500" : "text-slate-600"}`}>
                    {w.status}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Tabs — Overview / Transactions / Settings */}
        <div className="space-y-4">
          {/* Tab bar */}
          <div className="flex gap-1 p-1 bg-slate-800/50 border border-slate-700/40 rounded-xl">
            {(["overview", "transactions", "settings"] as const).map(t => (
              <button key={t} onClick={() => setActiveTab(t)}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold capitalize transition-all ${
                  activeTab === t
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    : "text-slate-500 hover:text-slate-300"
                }`}>
                {t}
              </button>
            ))}
          </div>

          {/* Overview */}
          {activeTab === "overview" && (
            <div className="space-y-3">
              {/* Balance */}
              <div className="p-4 rounded-xl border border-slate-700/50 bg-slate-800/40">
                <p className="text-xs text-slate-500 mb-1">Available Balance</p>
                <p className="text-2xl font-bold text-white">${card.balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-xs text-emerald-400">+2.4% this month</span>
                </div>
              </div>
              {/* Stats row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl border border-slate-700/50 bg-slate-800/40">
                  <div className="flex items-center gap-1.5 mb-1">
                    <ArrowUpRight className="w-3.5 h-3.5 text-red-400" />
                    <span className="text-xs text-slate-500">Spent</span>
                  </div>
                  <p className="text-base font-bold text-white">${card.spentThisMonth.toLocaleString()}</p>
                  <p className="text-[10px] text-slate-600">This month</p>
                </div>
                <div className="p-3 rounded-xl border border-slate-700/50 bg-slate-800/40">
                  <div className="flex items-center gap-1.5 mb-1">
                    <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-xs text-slate-500">Received</span>
                  </div>
                  <p className="text-base font-bold text-white">$5,200.00</p>
                  <p className="text-[10px] text-slate-600">This month</p>
                </div>
              </div>
              {/* NFC status */}
              <div className={`flex items-center gap-3 p-3.5 rounded-xl border ${
                card.nfcEnabled ? "border-amber-500/30 bg-amber-500/8" : "border-slate-700/40 bg-slate-800/30"
              }`}>
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                  card.nfcEnabled ? "bg-amber-500/20" : "bg-slate-700/50"
                }`}>
                  <Nfc className={`w-5 h-5 ${card.nfcEnabled ? "text-amber-400" : "text-slate-500"}`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">NFC Contactless Pay</p>
                  <p className="text-xs text-slate-500">
                    {card.nfcEnabled ? "Active — tap your phone or card to pay" : "Disabled — enable in settings"}
                  </p>
                </div>
                <div className={`w-2 h-2 rounded-full ${card.nfcEnabled ? "bg-emerald-400" : "bg-slate-600"}`} />
              </div>
              {/* Recent transactions preview */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Recent</p>
                  <button onClick={() => setActiveTab("transactions")} className="text-xs text-amber-400 hover:text-amber-300 transition-colors">
                    View all →
                  </button>
                </div>
                <div className="space-y-2">
                  {TRANSACTIONS.slice(0, 3).map(tx => (
                    <div key={tx.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-700/40 bg-slate-800/30">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${categoryColor(tx.category)}`}>
                        {categoryIcon(tx.category)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{tx.merchant}</p>
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs text-slate-500">{tx.date}</p>
                          {tx.nfc && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 font-medium">NFC</span>}
                        </div>
                      </div>
                      <p className="text-sm font-semibold text-red-400">-${tx.amount.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Transactions */}
          {activeTab === "transactions" && (
            <div className="space-y-3">
              {/* Filter */}
              <div className="flex gap-1.5">
                {(["all", "nfc", "online", "atm"] as const).map(f => (
                  <button key={f} onClick={() => setTxFilter(f)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                      txFilter === f
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        : "bg-slate-800/50 text-slate-500 border border-slate-700/40 hover:text-slate-300"
                    }`}>
                    {f === "nfc" ? "NFC" : f === "atm" ? "ATM" : f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {filteredTxs.map(tx => (
                  <motion.div key={tx.id} layout
                    className="flex items-center gap-3 p-3 rounded-xl border border-slate-700/40 bg-slate-800/30 hover:border-slate-600/50 transition-all">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${categoryColor(tx.category)}`}>
                      {categoryIcon(tx.category)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-medium text-white truncate">{tx.merchant}</p>
                        {tx.nfc && (
                          <span className="flex-shrink-0 flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 font-semibold">
                            <Wifi className="w-2.5 h-2.5" /> NFC
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500">{tx.date} · •••• {tx.cardLast4}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={`text-sm font-semibold ${tx.status === "declined" ? "text-red-400 line-through" : "text-red-400"}`}>
                        -${tx.amount.toFixed(2)}
                      </p>
                      <p className={`text-[10px] ${
                        tx.status === "completed" ? "text-emerald-500" :
                        tx.status === "pending" ? "text-amber-500" : "text-red-500"
                      }`}>{tx.status}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Settings */}
          {activeTab === "settings" && (
            <div className="space-y-3">
              {[
                { label: "NFC Contactless Payments", desc: "Tap to pay at terminals", value: card.nfcEnabled, action: toggleNfc, icon: <Nfc className="w-4 h-4" /> },
                { label: "Card Freeze", desc: card.frozen ? "Card is frozen — no transactions" : "Card is active", value: card.frozen, action: toggleFreeze, icon: card.frozen ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" /> },
              ].map((setting, i) => (
                <div key={i} className="flex items-center gap-3 p-4 rounded-xl border border-slate-700/50 bg-slate-800/40">
                  <div className="w-9 h-9 rounded-lg bg-slate-700/60 flex items-center justify-center text-slate-400">
                    {setting.icon}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{setting.label}</p>
                    <p className="text-xs text-slate-500">{setting.desc}</p>
                  </div>
                  <button onClick={setting.action}
                    className={`relative w-11 h-6 rounded-full transition-all duration-300 ${setting.value ? "bg-amber-500" : "bg-slate-600"}`}>
                    <motion.div animate={{ x: setting.value ? 20 : 2 }}
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                      className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                  </button>
                </div>
              ))}
              {[
                { label: "Spending Limit", desc: `$${card.spendingLimit.toLocaleString()} / month`, icon: <DollarSign className="w-4 h-4" /> },
                { label: "Change PIN", desc: "Last changed 3 months ago", icon: <Shield className="w-4 h-4" /> },
                { label: "Virtual Card Number", desc: "Generate a one-time card number", icon: <RefreshCw className="w-4 h-4" /> },
                { label: "International Payments", desc: "Enabled in 180+ countries", icon: <Globe className="w-4 h-4" /> },
              ].map((item, i) => (
                <button key={i} onClick={() => toast.info(`${item.label} — coming soon`)}
                  className="w-full flex items-center gap-3 p-4 rounded-xl border border-slate-700/50 bg-slate-800/40 hover:border-slate-600/60 transition-all text-left">
                  <div className="w-9 h-9 rounded-lg bg-slate-700/60 flex items-center justify-center text-slate-400">
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{item.label}</p>
                    <p className="text-xs text-slate-500">{item.desc}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-600" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* NFC Tap Modal */}
      <AnimatePresence>
        {showNfcModal && (
          <NfcTapModal card={card} onClose={() => setShowNfcModal(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
