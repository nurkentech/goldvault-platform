/**
 * Deposit — Multi-method deposit flow: Crypto, Bank Transfer, Card, Mobile Money
 */
import { useState } from "react";
import UserDashboardLayout from "@/components/UserDashboardLayout";
import { trpc } from "@/lib/trpc";
import { motion, AnimatePresence } from "framer-motion";
import {
  Copy, QrCode, CheckCircle2, AlertCircle, ArrowRight, ArrowLeft,
  Bitcoin, Building2, CreditCard, Smartphone, Globe, Zap,
  Loader2, CheckCircle, Wallet
} from "lucide-react";
import { toast } from "sonner";

// ─── Deposit Methods ─────────────────────────────────────────────────────────

type DepositMethod = "crypto" | "bank_transfer" | "card" | "mobile_money";

const depositMethods: {
  id: DepositMethod;
  name: string;
  description: string;
  icon: React.ElementType;
  badge: string;
  badgeColor: string;
  processingTime: string;
  fee: string;
}[] = [
  {
    id: "crypto",
    name: "Cryptocurrency",
    description: "Deposit BTC, ETH, USDT, SOL, USDC and more",
    icon: Bitcoin,
    badge: "Instant",
    badgeColor: "bg-green-500/20 text-green-400 border-green-500/30",
    processingTime: "5–30 minutes",
    fee: "Free (network fees apply)",
  },
  {
    id: "bank_transfer",
    name: "Bank Transfer",
    description: "Wire transfer via SWIFT, ACH, SEPA, or local bank",
    icon: Building2,
    badge: "Low Fee",
    badgeColor: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    processingTime: "1–3 business days",
    fee: "Free – $25",
  },
  {
    id: "card",
    name: "Credit / Debit Card",
    description: "Visa, Mastercard, or American Express",
    icon: CreditCard,
    badge: "Instant",
    badgeColor: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    processingTime: "Instant",
    fee: "2.5% processing fee",
  },
  {
    id: "mobile_money",
    name: "Mobile Money",
    description: "M-Pesa, MTN Mobile Money, Airtel Money, Orange Money",
    icon: Smartphone,
    badge: "Africa & Asia",
    badgeColor: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    processingTime: "5–15 minutes",
    fee: "1.5% processing fee",
  },
];

// ─── Crypto currencies ───────────────────────────────────────────────────────

const cryptoCurrencies = [
  { symbol: "BTC", name: "Bitcoin", network: "Bitcoin Network", icon: "₿", color: "from-orange-500 to-orange-600", minDeposit: "0.0001 BTC", confirmations: 3 },
  { symbol: "ETH", name: "Ethereum", network: "ERC-20", icon: "Ξ", color: "from-purple-500 to-purple-600", minDeposit: "0.01 ETH", confirmations: 12 },
  { symbol: "USDT", name: "Tether", network: "TRC-20", icon: "$", color: "from-emerald-500 to-emerald-600", minDeposit: "10 USDT", confirmations: 20 },
  { symbol: "SOL", name: "Solana", network: "Solana Network", icon: "◎", color: "from-green-500 to-green-600", minDeposit: "0.1 SOL", confirmations: 1 },
  { symbol: "USDC", name: "USD Coin", network: "ERC-20", icon: "$", color: "from-blue-500 to-blue-600", minDeposit: "10 USDC", confirmations: 12 },
  { symbol: "XRP", name: "Ripple", network: "XRP Ledger", icon: "X", color: "from-slate-400 to-slate-500", minDeposit: "10 XRP", confirmations: 1 },
  { symbol: "BNB", name: "BNB", network: "BNB Smart Chain", icon: "B", color: "from-yellow-500 to-yellow-600", minDeposit: "0.01 BNB", confirmations: 15 },
  { symbol: "XAU", name: "Gold (XAU)", network: "GoldVault Network", icon: "Au", color: "from-amber-500 to-amber-600", minDeposit: "0.001 XAU", confirmations: 1 },
];

// ─── Bank Transfer options ───────────────────────────────────────────────────

const bankMethods = [
  { id: "ach", name: "ACH Transfer (US)", region: "United States", fee: "Free", time: "1–3 business days", currency: "USD", icon: "🇺🇸" },
  { id: "swift", name: "International Wire (SWIFT)", region: "Worldwide", fee: "$25 flat", time: "1–5 business days", currency: "USD/EUR/GBP", icon: "🌍" },
  { id: "sepa", name: "SEPA Transfer (EU)", region: "Europe (SEPA Zone)", fee: "€0.50", time: "Same day / next day", currency: "EUR", icon: "🇪🇺" },
  { id: "faster_payments", name: "Faster Payments (UK)", region: "United Kingdom", fee: "Free", time: "Instant", currency: "GBP", icon: "🇬🇧" },
  { id: "interac", name: "Interac e-Transfer (CA)", region: "Canada", fee: "Free", time: "30 minutes", currency: "CAD", icon: "🇨🇦" },
  { id: "pix", name: "PIX (Brazil)", region: "Brazil", fee: "Free", time: "Instant", currency: "BRL", icon: "🇧🇷" },
];

// ─── Mobile Money options ────────────────────────────────────────────────────

const mobileMethods = [
  { id: "mpesa", name: "M-Pesa", region: "Kenya, Tanzania, DRC", fee: "1.5%", time: "5–15 minutes", icon: "📱", color: "from-green-600 to-green-700" },
  { id: "mtn", name: "MTN Mobile Money", region: "Ghana, Uganda, Cameroon", fee: "1.5%", time: "5–15 minutes", icon: "📱", color: "from-yellow-500 to-yellow-600" },
  { id: "airtel", name: "Airtel Money", region: "Nigeria, Kenya, Uganda", fee: "1.5%", time: "5–15 minutes", icon: "📱", color: "from-red-500 to-red-600" },
  { id: "orange", name: "Orange Money", region: "Senegal, Côte d'Ivoire, Mali", fee: "1.5%", time: "5–15 minutes", icon: "📱", color: "from-orange-500 to-orange-600" },
  { id: "gcash", name: "GCash", region: "Philippines", fee: "1.5%", time: "5–10 minutes", icon: "📱", color: "from-blue-500 to-blue-600" },
  { id: "wave", name: "Wave", region: "Senegal, Côte d'Ivoire", fee: "1%", time: "5–10 minutes", icon: "📱", color: "from-indigo-500 to-indigo-600" },
];

// ─── Admin-configured deposit addresses ─────────────────────────────────────

// ─── Main Component ──────────────────────────────────────────────────────────

export default function Deposit() {
  return (
    <UserDashboardLayout>
      <DepositContent />
    </UserDashboardLayout>
  );
}

function DepositContent() {
  const [selectedMethod, setSelectedMethod] = useState<DepositMethod | null>(null);
  const [step, setStep] = useState<"method" | "details" | "success">("method");
  const [successTxHash, setSuccessTxHash] = useState("");

  const handleBack = () => {
    if (step === "details") {
      setStep("method");
      setSelectedMethod(null);
    }
  };

  const handleSuccess = (txHash: string) => {
    setSuccessTxHash(txHash);
    setStep("success");
  };

  const handleReset = () => {
    setStep("method");
    setSelectedMethod(null);
    setSuccessTxHash("");
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        {step === "details" && (
          <button onClick={handleBack} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
        )}
        <div>
          <h2 className="text-xl font-bold text-foreground">Deposit Funds</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {step === "method" && "Choose your preferred deposit method"}
            {step === "details" && `Deposit via ${depositMethods.find(m => m.id === selectedMethod)?.name}`}
            {step === "success" && "Deposit request submitted successfully"}
          </p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: Method Selection */}
        {step === "method" && (
          <motion.div
            key="method"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            {depositMethods.map((method) => {
              const Icon = method.icon;
              return (
                <motion.button
                  key={method.id}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => { setSelectedMethod(method.id); setStep("details"); }}
                  className="p-5 rounded-2xl border border-white/5 bg-card/50 hover:border-amber-500/30 transition-all text-left group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-11 h-11 rounded-xl bg-amber-500/10 flex items-center justify-center group-hover:bg-amber-500/20 transition-colors">
                      <Icon className="w-5 h-5 text-amber-400" />
                    </div>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${method.badgeColor}`}>
                      {method.badge}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-foreground mb-1">{method.name}</h3>
                  <p className="text-xs text-muted-foreground mb-3">{method.description}</p>
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                    <span>Fee: {method.fee}</span>
                    <span>{method.processingTime}</span>
                  </div>
                </motion.button>
              );
            })}
          </motion.div>
        )}

        {/* Step 2: Method Details */}
        {step === "details" && selectedMethod === "crypto" && (
          <motion.div key="crypto" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <CryptoDeposit onSuccess={handleSuccess} />
          </motion.div>
        )}
        {step === "details" && selectedMethod === "bank_transfer" && (
          <motion.div key="bank" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <BankTransferDeposit onSuccess={handleSuccess} />
          </motion.div>
        )}
        {step === "details" && selectedMethod === "card" && (
          <motion.div key="card" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <CardDeposit onSuccess={handleSuccess} />
          </motion.div>
        )}
        {step === "details" && selectedMethod === "mobile_money" && (
          <motion.div key="mobile" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <MobileMoneyDeposit onSuccess={handleSuccess} />
          </motion.div>
        )}

        {/* Step 3: Success */}
        {step === "success" && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card/50 border border-white/5 rounded-2xl p-4 sm:p-8 text-center space-y-4"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 border-2 border-green-500/30">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <h3 className="text-lg font-bold text-foreground">Deposit Request Submitted</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Your deposit is being processed. You'll receive a notification once it's confirmed.
            </p>
            <div className="bg-white/5 rounded-lg px-4 py-2 inline-block">
              <p className="text-[10px] text-muted-foreground">Reference ID</p>
              <code className="text-sm text-amber-400 font-mono">{successTxHash}</code>
            </div>
            <div className="pt-2">
              <button
                onClick={handleReset}
                className="px-6 py-2.5 bg-amber-500 text-black font-semibold rounded-xl text-sm hover:bg-amber-400 transition-colors"
              >
                Make Another Deposit
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Crypto Deposit ──────────────────────────────────────────────────────────

function CryptoDeposit({ onSuccess }: { onSuccess: (txHash: string) => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const { data: depositAddresses = {}, isLoading: loadingAddresses } = trpc.platform.depositAddresses.useQuery();
  const selectedCurrency = cryptoCurrencies.find(c => c.symbol === selected);
  const selectedAddress = selectedCurrency ? depositAddresses[selectedCurrency.symbol] : undefined;
  const depositMutation = trpc.transaction.requestDeposit.useMutation({
    onSuccess: (data) => onSuccess(data.txHash),
    onError: (err) => toast.error(err.message),
  });

  return (
    <div className="space-y-5">
      {/* Currency Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {cryptoCurrencies.map((currency) => (
          <motion.button
            key={currency.symbol}
            whileTap={{ scale: 0.97 }}
            onClick={() => setSelected(currency.symbol)}
            className={`p-3.5 rounded-xl border transition-all text-left ${
              selected === currency.symbol
                ? "border-amber-500/50 bg-amber-500/5"
                : "border-white/5 bg-card/50 hover:border-white/10"
            }`}
          >
            <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${currency.color} flex items-center justify-center text-white font-bold text-xs mb-2`}>
              {currency.icon}
            </div>
            <p className="text-xs font-semibold text-foreground">{currency.symbol}</p>
            <p className="text-[10px] text-muted-foreground">{currency.network}</p>
          </motion.button>
        ))}
      </div>

      {/* Deposit Address */}
      {selectedCurrency && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card/50 backdrop-blur-sm border border-white/5 rounded-2xl p-6 space-y-5"
        >
          <div className="flex items-center gap-3 pb-4 border-b border-white/5">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${selectedCurrency.color} flex items-center justify-center text-white font-bold text-sm`}>
              {selectedCurrency.icon}
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Deposit {selectedCurrency.name}</p>
              <p className="text-xs text-muted-foreground">Network: {selectedCurrency.network}</p>
            </div>
          </div>

          {/* QR Code */}
          <div className="flex justify-center">
            <div className="w-44 h-44 bg-white rounded-xl flex items-center justify-center">
              <QrCode className="w-28 h-28 text-gray-800" />
            </div>
          </div>

          {/* Address */}
          <div>
            <p className="text-xs text-muted-foreground mb-2">Deposit Address</p>
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-3">
              <code className="text-xs text-foreground flex-1 break-all font-mono">{loadingAddresses ? "Loading address…" : selectedAddress || "Address not configured"}</code>
              <button
                onClick={() => {
                  if (!selectedAddress) return;
                  navigator.clipboard.writeText(selectedAddress);
                  toast.success("Address copied!");
                }}
                disabled={!selectedAddress}
                className="p-2 rounded-lg bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 transition-colors shrink-0"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-2 block">Amount sent</label>
            <input type="number" min="0" step="any" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder={`0.00 ${selectedCurrency.symbol}`} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/50" />
          </div>

          {/* Info */}
          <div className="space-y-2">
            <div className="flex items-start gap-2 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span className="text-muted-foreground">Minimum deposit: <span className="text-foreground font-medium">{selectedCurrency.minDeposit}</span></span>
            </div>
            <div className="flex items-start gap-2 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span className="text-muted-foreground">Required confirmations: <span className="text-foreground font-medium">{selectedCurrency.confirmations}</span></span>
            </div>
            <div className="flex items-start gap-2 text-xs">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span className="text-muted-foreground">Only send <span className="text-foreground font-medium">{selectedCurrency.symbol}</span> on <span className="text-foreground font-medium">{selectedCurrency.network}</span>. Sending other assets may result in permanent loss.</span>
            </div>
          </div>

          {/* Confirm Deposit Button */}
          <button
            onClick={() => depositMutation.mutate({ method: "crypto", currency: selectedCurrency.symbol, amount, network: selectedCurrency.network })}
            disabled={depositMutation.isPending || !selectedAddress || !(Number(amount) > 0)}
            className="w-full py-3 bg-amber-500 text-black font-semibold rounded-xl hover:bg-amber-400 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {depositMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            I've Sent the Deposit
          </button>
        </motion.div>
      )}
    </div>
  );
}

// ─── Bank Transfer Deposit ───────────────────────────────────────────────────

function BankTransferDeposit({ onSuccess }: { onSuccess: (txHash: string) => void }) {
  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const depositMutation = trpc.transaction.requestDeposit.useMutation({
    onSuccess: (data) => onSuccess(data.txHash),
    onError: (err) => toast.error(err.message),
  });

  const selectedMethod = bankMethods.find(m => m.id === selectedBank);

  return (
    <div className="space-y-5">
      {/* Bank Method Selection */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {bankMethods.map((method) => (
          <motion.button
            key={method.id}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedBank(method.id)}
            className={`p-4 rounded-xl border transition-all text-left ${
              selectedBank === method.id
                ? "border-amber-500/50 bg-amber-500/5"
                : "border-white/5 bg-card/50 hover:border-white/10"
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xl">{method.icon}</span>
              <div>
                <p className="text-sm font-semibold text-foreground">{method.name}</p>
                <p className="text-[10px] text-muted-foreground">{method.region}</p>
              </div>
            </div>
            <div className="flex items-center justify-between text-[10px] text-muted-foreground">
              <span>Fee: {method.fee}</span>
              <span>{method.time}</span>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Bank Details Form */}
      {selectedMethod && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card/50 border border-white/5 rounded-2xl p-6 space-y-5"
        >
          <h3 className="text-sm font-semibold text-foreground">Transfer Details — {selectedMethod.name}</h3>

          {/* Bank details to send to */}
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 space-y-3">
            <p className="text-xs font-medium text-amber-400 mb-2">Send your transfer to:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-muted-foreground">Bank Name</p>
                <p className="text-foreground font-medium">GoldVaults International Ltd.</p>
              </div>
              <div>
                <p className="text-muted-foreground">Account Number</p>
                <p className="text-foreground font-medium font-mono">8294 7361 0042</p>
              </div>
              <div>
                <p className="text-muted-foreground">Routing / SWIFT</p>
                <p className="text-foreground font-medium font-mono">GVLTUS33XXX</p>
              </div>
              <div>
                <p className="text-muted-foreground">Reference</p>
                <p className="text-foreground font-medium font-mono">GV-{Date.now().toString(36).toUpperCase().slice(0, 6)}</p>
              </div>
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="text-xs text-muted-foreground mb-2 block">Deposit Amount ({selectedMethod.currency})</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>

          {/* Fee Summary */}
          <div className="bg-white/5 rounded-xl p-4 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Fee</span>
              <span className="text-foreground">{selectedMethod.fee}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Processing Time</span>
              <span className="text-foreground">{selectedMethod.time}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Currency</span>
              <span className="text-foreground">{selectedMethod.currency}</span>
            </div>
          </div>

          <button
            onClick={() => {
              if (!amount || parseFloat(amount) <= 0) { toast.error("Please enter a valid amount"); return; }
              depositMutation.mutate({
                method: "bank_transfer",
                currency: selectedMethod.currency.split("/")[0],
                amount,
                metadata: { bankMethod: selectedMethod.id, region: selectedMethod.region },
              });
            }}
            disabled={depositMutation.isPending}
            className="w-full py-3 bg-amber-500 text-black font-semibold rounded-xl hover:bg-amber-400 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {depositMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Building2 className="w-4 h-4" />}
            I've Initiated the Transfer
          </button>
        </motion.div>
      )}
    </div>
  );
}

// ─── Card Deposit ────────────────────────────────────────────────────────────

function CardDeposit({ onSuccess }: { onSuccess: (txHash: string) => void }) {
  const [amount, setAmount] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [name, setName] = useState("");
  const depositMutation = trpc.transaction.requestDeposit.useMutation({
    onSuccess: (data) => onSuccess(data.txHash),
    onError: (err) => toast.error(err.message),
  });

  const formatCardNumber = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(.{4})/g, "$1 ").trim();
  };

  const formatExpiry = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 4);
    if (digits.length >= 3) return digits.slice(0, 2) + "/" + digits.slice(2);
    return digits;
  };

  return (
    <div className="space-y-5">
      <div className="bg-card/50 border border-white/5 rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-3 pb-4 border-b border-white/5">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Card Payment</p>
            <p className="text-xs text-muted-foreground">Visa, Mastercard, American Express</p>
          </div>
        </div>

        {/* Amount */}
        <div>
          <label className="text-xs text-muted-foreground mb-2 block">Deposit Amount (USD)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            min="10"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          />
          <p className="text-[10px] text-muted-foreground mt-1">Minimum: $10 | Maximum: $10,000 per transaction</p>
        </div>

        {/* Card Details */}
        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Cardholder Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Card Number</label>
            <input
              type="text"
              value={cardNumber}
              onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
              placeholder="4242 4242 4242 4242"
              maxLength={19}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/50 font-mono"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Expiry</label>
              <input
                type="text"
                value={expiry}
                onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                placeholder="MM/YY"
                maxLength={5}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/50 font-mono"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">CVV</label>
              <input
                type="password"
                value={cvv}
                onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                placeholder="•••"
                maxLength={4}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/50 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Fee Info */}
        <div className="bg-white/5 rounded-xl p-4 space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Processing Fee</span>
            <span className="text-foreground">2.5%{amount ? ` ($${(parseFloat(amount) * 0.025).toFixed(2)})` : ""}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">You'll receive</span>
            <span className="text-foreground font-medium">{amount ? `$${(parseFloat(amount) * 0.975).toFixed(2)}` : "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Processing Time</span>
            <span className="text-foreground">Instant</span>
          </div>
        </div>

        <div className="flex items-start gap-2 p-3 bg-green-500/5 border border-green-500/20 rounded-xl">
          <Zap className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
          <p className="text-[11px] text-muted-foreground">
            Card payments are processed instantly. Funds will appear in your wallet within seconds.
          </p>
        </div>

        <button
          onClick={() => {
            if (!amount || parseFloat(amount) < 10) { toast.error("Minimum deposit is $10"); return; }
            if (!cardNumber || cardNumber.replace(/\s/g, "").length < 16) { toast.error("Please enter a valid card number"); return; }
            if (!expiry || expiry.length < 5) { toast.error("Please enter card expiry"); return; }
            if (!cvv || cvv.length < 3) { toast.error("Please enter CVV"); return; }
            depositMutation.mutate({
              method: "card",
              currency: "USD",
              amount,
              metadata: { cardLast4: cardNumber.replace(/\s/g, "").slice(-4), cardholderName: name },
            });
          }}
          disabled={depositMutation.isPending}
          className="w-full py-3 bg-amber-500 text-black font-semibold rounded-xl hover:bg-amber-400 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {depositMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
          Pay ${amount || "0.00"}
        </button>
      </div>
    </div>
  );
}

// ─── Mobile Money Deposit ────────────────────────────────────────────────────

function MobileMoneyDeposit({ onSuccess }: { onSuccess: (txHash: string) => void }) {
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [amount, setAmount] = useState("");
  const depositMutation = trpc.transaction.requestDeposit.useMutation({
    onSuccess: (data) => onSuccess(data.txHash),
    onError: (err) => toast.error(err.message),
  });

  const provider = mobileMethods.find(m => m.id === selectedProvider);

  return (
    <div className="space-y-5">
      {/* Provider Selection */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {mobileMethods.map((method) => (
          <motion.button
            key={method.id}
            whileTap={{ scale: 0.97 }}
            onClick={() => setSelectedProvider(method.id)}
            className={`p-3.5 rounded-xl border transition-all text-left ${
              selectedProvider === method.id
                ? "border-amber-500/50 bg-amber-500/5"
                : "border-white/5 bg-card/50 hover:border-white/10"
            }`}
          >
            <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${method.color} flex items-center justify-center text-white text-sm mb-2`}>
              <Smartphone className="w-4 h-4" />
            </div>
            <p className="text-xs font-semibold text-foreground">{method.name}</p>
            <p className="text-[10px] text-muted-foreground">{method.region}</p>
          </motion.button>
        ))}
      </div>

      {/* Mobile Money Form */}
      {provider && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card/50 border border-white/5 rounded-2xl p-6 space-y-5"
        >
          <div className="flex items-center gap-3 pb-4 border-b border-white/5">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${provider.color} flex items-center justify-center`}>
              <Smartphone className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{provider.name}</p>
              <p className="text-xs text-muted-foreground">{provider.region}</p>
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <label className="text-xs text-muted-foreground mb-2 block">Mobile Number</label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+254 7XX XXX XXX"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>

          {/* Amount */}
          <div>
            <label className="text-xs text-muted-foreground mb-2 block">Amount (USD equivalent)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              min="5"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
            <p className="text-[10px] text-muted-foreground mt-1">Min: $5 | Max: $5,000 per transaction</p>
          </div>

          {/* Fee Info */}
          <div className="bg-white/5 rounded-xl p-4 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Fee</span>
              <span className="text-foreground">{provider.fee}{amount ? ` ($${(parseFloat(amount) * 0.015).toFixed(2)})` : ""}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Processing Time</span>
              <span className="text-foreground">{provider.time}</span>
            </div>
          </div>

          <div className="flex items-start gap-2 p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-[11px] text-muted-foreground">
              You'll receive an STK push notification on your phone. Confirm the payment to complete the deposit.
            </p>
          </div>

          <button
            onClick={() => {
              if (!phoneNumber) { toast.error("Please enter your mobile number"); return; }
              if (!amount || parseFloat(amount) < 5) { toast.error("Minimum deposit is $5"); return; }
              depositMutation.mutate({
                method: "mobile_money",
                currency: "USD",
                amount,
                metadata: { provider: provider.id, phoneNumber, region: provider.region },
              });
            }}
            disabled={depositMutation.isPending}
            className="w-full py-3 bg-amber-500 text-black font-semibold rounded-xl hover:bg-amber-400 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {depositMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Smartphone className="w-4 h-4" />}
            Send Payment Request
          </button>
        </motion.div>
      )}
    </div>
  );
}
