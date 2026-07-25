/**
 * Withdraw — Multi-method withdrawal flow: Crypto, Bank Wire, Card Payout, Mobile Money
 */
import { useState } from "react";
import UserDashboardLayout from "@/components/UserDashboardLayout";
import { trpc } from "@/lib/trpc";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Bitcoin, Building2, CreditCard, Smartphone,
  Loader2, CheckCircle, AlertCircle, Wallet, Zap, Shield
} from "lucide-react";
import { toast } from "sonner";

// ─── Withdrawal Methods ──────────────────────────────────────────────────────

type WithdrawMethod = "crypto" | "bank_wire" | "card_payout" | "mobile_money";

const withdrawMethods: {
  id: WithdrawMethod;
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
    name: "Crypto Wallet",
    description: "Send to any external BTC, ETH, SOL, USDT wallet",
    icon: Bitcoin,
    badge: "Fast",
    badgeColor: "bg-green-500/20 text-green-400 border-green-500/30",
    processingTime: "5–30 minutes",
    fee: "0.1% + network gas",
  },
  {
    id: "bank_wire",
    name: "Bank Wire Transfer",
    description: "ACH (US), SWIFT (International), SEPA (EU), Faster Payments (UK)",
    icon: Building2,
    badge: "Low Fee",
    badgeColor: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    processingTime: "1–5 business days",
    fee: "Free – $25",
  },
  {
    id: "card_payout",
    name: "Card Payout",
    description: "Instant payout to Visa or Mastercard debit card",
    icon: CreditCard,
    badge: "Instant",
    badgeColor: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    processingTime: "Instant",
    fee: "1.5% processing fee",
  },
  {
    id: "mobile_money",
    name: "Mobile Money",
    description: "M-Pesa, MTN, Airtel Money, Orange Money, GCash, Wave",
    icon: Smartphone,
    badge: "Africa & Asia",
    badgeColor: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    processingTime: "5–15 minutes",
    fee: "1.5% processing fee",
  },
];

// ─── Crypto Options ──────────────────────────────────────────────────────────

const cryptoOptions = [
  { symbol: "BTC", name: "Bitcoin", network: "Bitcoin Network", icon: "₿", color: "from-orange-500 to-orange-600", fee: "0.0001 BTC", minWithdraw: "0.001 BTC" },
  { symbol: "ETH", name: "Ethereum", network: "ERC-20", icon: "Ξ", color: "from-purple-500 to-purple-600", fee: "0.005 ETH", minWithdraw: "0.01 ETH" },
  { symbol: "USDT", name: "Tether", network: "TRC-20", icon: "$", color: "from-emerald-500 to-emerald-600", fee: "1 USDT", minWithdraw: "10 USDT" },
  { symbol: "SOL", name: "Solana", network: "Solana Network", icon: "◎", color: "from-green-500 to-green-600", fee: "0.01 SOL", minWithdraw: "0.1 SOL" },
  { symbol: "USDC", name: "USD Coin", network: "ERC-20", icon: "$", color: "from-blue-500 to-blue-600", fee: "1 USDC", minWithdraw: "10 USDC" },
  { symbol: "XRP", name: "Ripple", network: "XRP Ledger", icon: "X", color: "from-slate-400 to-slate-500", fee: "0.1 XRP", minWithdraw: "10 XRP" },
  { symbol: "BNB", name: "BNB", network: "BNB Smart Chain", icon: "B", color: "from-yellow-500 to-yellow-600", fee: "0.001 BNB", minWithdraw: "0.01 BNB" },
  { symbol: "PAXG", name: "PAX Gold", network: "ERC-20", icon: "Au", color: "from-amber-500 to-amber-600", fee: "0.001 PAXG", minWithdraw: "0.01 PAXG" },
];

// ─── Bank Wire Options ───────────────────────────────────────────────────────

const bankWireOptions = [
  { id: "ach", name: "ACH Transfer (US)", region: "United States", fee: "Free (standard) / $5 (same-day)", time: "1–3 business days", currency: "USD", icon: "🇺🇸" },
  { id: "swift", name: "International Wire (SWIFT)", region: "Worldwide", fee: "$25 flat", time: "1–5 business days", currency: "USD/EUR/GBP", icon: "🌍" },
  { id: "sepa", name: "SEPA Transfer (EU)", region: "Europe (SEPA Zone)", fee: "€0.50", time: "Same day / next day", currency: "EUR", icon: "🇪🇺" },
  { id: "faster_payments", name: "Faster Payments (UK)", region: "United Kingdom", fee: "Free", time: "Instant", currency: "GBP", icon: "🇬🇧" },
  { id: "interac", name: "Interac e-Transfer (CA)", region: "Canada", fee: "Free", time: "30 minutes", currency: "CAD", icon: "🇨🇦" },
  { id: "pix", name: "PIX (Brazil)", region: "Brazil", fee: "Free", time: "Instant", currency: "BRL", icon: "🇧🇷" },
];

// ─── Mobile Money Options ────────────────────────────────────────────────────

const mobileOptions = [
  { id: "mpesa", name: "M-Pesa", region: "Kenya, Tanzania, DRC", fee: "1.5%", time: "5–15 minutes", color: "from-green-600 to-green-700" },
  { id: "mtn", name: "MTN Mobile Money", region: "Ghana, Uganda, Cameroon", fee: "1.5%", time: "5–15 minutes", color: "from-yellow-500 to-yellow-600" },
  { id: "airtel", name: "Airtel Money", region: "Nigeria, Kenya, Uganda", fee: "1.5%", time: "5–15 minutes", color: "from-red-500 to-red-600" },
  { id: "orange", name: "Orange Money", region: "Senegal, Côte d'Ivoire, Mali", fee: "1.5%", time: "5–15 minutes", color: "from-orange-500 to-orange-600" },
  { id: "gcash", name: "GCash", region: "Philippines", fee: "1.5%", time: "5–10 minutes", color: "from-blue-500 to-blue-600" },
  { id: "wave", name: "Wave", region: "Senegal, Côte d'Ivoire", fee: "1%", time: "5–10 minutes", color: "from-indigo-500 to-indigo-600" },
];

// ─── Main Component ──────────────────────────────────────────────────────────

export default function Withdraw() {
  return (
    <UserDashboardLayout>
      <WithdrawContent />
    </UserDashboardLayout>
  );
}

function WithdrawContent() {
  const [selectedMethod, setSelectedMethod] = useState<WithdrawMethod | null>(null);
  const [step, setStep] = useState<"method" | "details" | "success">("method");
  const [successTxHash, setSuccessTxHash] = useState("");

  const handleBack = () => { if (step === "details") { setStep("method"); setSelectedMethod(null); } };
  const handleSuccess = (txHash: string) => { setSuccessTxHash(txHash); setStep("success"); };
  const handleReset = () => { setStep("method"); setSelectedMethod(null); setSuccessTxHash(""); };

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
          <h2 className="text-xl font-bold text-foreground">Withdraw Funds</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {step === "method" && "Choose your preferred withdrawal method"}
            {step === "details" && `Withdraw via ${withdrawMethods.find(m => m.id === selectedMethod)?.name}`}
            {step === "success" && "Withdrawal request submitted"}
          </p>
        </div>
      </div>

      {/* Security Notice */}
      {step === "method" && (
        <div className="flex items-start gap-3 p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl">
          <Shield className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-medium text-foreground">Security Notice</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              All withdrawals are reviewed for security. Large withdrawals may require additional verification. Processing times vary by method.
            </p>
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        {/* Step 1: Method Selection */}
        {step === "method" && (
          <motion.div key="method" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {withdrawMethods.map((method) => {
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
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${method.badgeColor}`}>{method.badge}</span>
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

        {/* Step 2: Details */}
        {step === "details" && selectedMethod === "crypto" && (
          <motion.div key="crypto" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <CryptoWithdraw onSuccess={handleSuccess} />
          </motion.div>
        )}
        {step === "details" && selectedMethod === "bank_wire" && (
          <motion.div key="bank" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <BankWireWithdraw onSuccess={handleSuccess} />
          </motion.div>
        )}
        {step === "details" && selectedMethod === "card_payout" && (
          <motion.div key="card" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <CardPayoutWithdraw onSuccess={handleSuccess} />
          </motion.div>
        )}
        {step === "details" && selectedMethod === "mobile_money" && (
          <motion.div key="mobile" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <MobileMoneyWithdraw onSuccess={handleSuccess} />
          </motion.div>
        )}

        {/* Step 3: Success */}
        {step === "success" && (
          <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-card/50 border border-white/5 rounded-2xl p-4 sm:p-8 text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 border-2 border-green-500/30">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <h3 className="text-lg font-bold text-foreground">Withdrawal Request Submitted</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Your withdrawal is pending approval. You'll receive a notification once it's processed.
            </p>
            <div className="bg-white/5 rounded-lg px-4 py-2 inline-block">
              <p className="text-[10px] text-muted-foreground">Reference ID</p>
              <code className="text-sm text-amber-400 font-mono">{successTxHash}</code>
            </div>
            <div className="pt-2">
              <button onClick={handleReset} className="px-6 py-2.5 bg-amber-500 text-black font-semibold rounded-xl text-sm hover:bg-amber-400 transition-colors">
                Make Another Withdrawal
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Crypto Withdraw ─────────────────────────────────────────────────────────

function TwoFactorField({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div>
      <label className="text-xs text-muted-foreground mb-2 block">Two-factor code (if enabled)</label>
      <input
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        value={value}
        onChange={(event) => onChange(event.target.value.trim())}
        placeholder="Authenticator, SMS, or backup code"
        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/50"
      />
    </div>
  );
}

function CryptoWithdraw({ onSuccess }: { onSuccess: (txHash: string) => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [address, setAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const selectedCrypto = cryptoOptions.find(c => c.symbol === selected);
  const withdrawMutation = trpc.transaction.requestWithdrawal.useMutation({
    onSuccess: (data) => onSuccess(data.txHash),
    onError: (err) => toast.error(err.message),
  });

  return (
    <div className="space-y-5">
      {/* Currency Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {cryptoOptions.map((c) => (
          <motion.button
            key={c.symbol}
            whileTap={{ scale: 0.97 }}
            onClick={() => setSelected(c.symbol)}
            className={`p-3.5 rounded-xl border transition-all text-left ${
              selected === c.symbol ? "border-amber-500/50 bg-amber-500/5" : "border-white/5 bg-card/50 hover:border-white/10"
            }`}
          >
            <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${c.color} flex items-center justify-center text-white font-bold text-xs mb-2`}>{c.icon}</div>
            <p className="text-xs font-semibold text-foreground">{c.symbol}</p>
            <p className="text-[10px] text-muted-foreground">{c.network}</p>
          </motion.button>
        ))}
      </div>

      {/* Withdrawal Form */}
      {selectedCrypto && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card/50 border border-white/5 rounded-2xl p-6 space-y-5">
          <div className="flex items-center gap-3 pb-4 border-b border-white/5">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${selectedCrypto.color} flex items-center justify-center text-white font-bold text-sm`}>{selectedCrypto.icon}</div>
            <div>
              <p className="text-sm font-semibold text-foreground">Withdraw {selectedCrypto.name}</p>
              <p className="text-xs text-muted-foreground">Network: {selectedCrypto.network}</p>
            </div>
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-2 block">Recipient Wallet Address</label>
            <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder={`Enter ${selectedCrypto.symbol} address`} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/50 font-mono" />
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-2 block">Amount</label>
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/50" />
            <p className="text-[10px] text-muted-foreground mt-1">Min: {selectedCrypto.minWithdraw}</p>
          </div>

          <div className="bg-white/5 rounded-xl p-4 space-y-2 text-xs">
            <div className="flex justify-between"><span className="text-muted-foreground">Network Fee</span><span className="text-foreground">{selectedCrypto.fee}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Processing Time</span><span className="text-foreground">5–30 minutes</span></div>
            <div className="flex justify-between border-t border-white/5 pt-2 mt-2"><span className="text-muted-foreground font-medium">You'll receive</span><span className="text-foreground font-medium">{amount || "0"} {selectedCrypto.symbol}</span></div>
          </div>

          <TwoFactorField value={twoFactorCode} onChange={setTwoFactorCode} />

          <button
            onClick={() => {
              if (!address || address.length < 20) { toast.error("Please enter a valid wallet address"); return; }
              if (!amount || parseFloat(amount) <= 0) { toast.error("Please enter a valid amount"); return; }
              withdrawMutation.mutate({ method: "crypto", currency: selectedCrypto.symbol, amount, fee: selectedCrypto.fee.split(" ")[0], destination: address, network: selectedCrypto.network, twoFactorCode: twoFactorCode || undefined, metadata: { symbol: selectedCrypto.symbol } });
            }}
            disabled={withdrawMutation.isPending}
            className="w-full py-3 bg-amber-500 text-black font-semibold rounded-xl hover:bg-amber-400 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {withdrawMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wallet className="w-4 h-4" />}
            Withdraw {selectedCrypto.symbol}
          </button>
        </motion.div>
      )}
    </div>
  );
}

// ─── Bank Wire Withdraw ──────────────────────────────────────────────────────

function BankWireWithdraw({ onSuccess }: { onSuccess: (txHash: string) => void }) {
  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [bankName, setBankName] = useState("");
  const [routingCode, setRoutingCode] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const withdrawMutation = trpc.transaction.requestWithdrawal.useMutation({
    onSuccess: (data) => onSuccess(data.txHash),
    onError: (err) => toast.error(err.message),
  });

  const bankMethod = bankWireOptions.find(b => b.id === selectedBank);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {bankWireOptions.map((method) => (
          <motion.button
            key={method.id}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedBank(method.id)}
            className={`p-4 rounded-xl border transition-all text-left ${selectedBank === method.id ? "border-amber-500/50 bg-amber-500/5" : "border-white/5 bg-card/50 hover:border-white/10"}`}
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

      {bankMethod && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card/50 border border-white/5 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-semibold text-foreground pb-3 border-b border-white/5">Bank Account Details — {bankMethod.name}</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Account Holder Name</label>
              <input type="text" value={accountName} onChange={(e) => setAccountName(e.target.value)} placeholder="John Doe" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/50" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Bank Name</label>
              <input type="text" value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="Chase Bank" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/50" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Account / IBAN Number</label>
              <input type="text" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} placeholder="XXXX XXXX XXXX" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/50 font-mono" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">{bankMethod.id === "swift" ? "SWIFT/BIC Code" : bankMethod.id === "sepa" ? "BIC Code" : "Routing Number"}</label>
              <input type="text" value={routingCode} onChange={(e) => setRoutingCode(e.target.value)} placeholder={bankMethod.id === "swift" ? "CHASUS33" : "021000021"} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/50 font-mono" />
            </div>
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-2 block">Withdrawal Amount ({bankMethod.currency.split("/")[0]})</label>
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/50" />
          </div>

          <div className="bg-white/5 rounded-xl p-4 space-y-2 text-xs">
            <div className="flex justify-between"><span className="text-muted-foreground">Fee</span><span className="text-foreground">{bankMethod.fee}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Processing Time</span><span className="text-foreground">{bankMethod.time}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Currency</span><span className="text-foreground">{bankMethod.currency}</span></div>
          </div>

          <TwoFactorField value={twoFactorCode} onChange={setTwoFactorCode} />

          <button
            onClick={() => {
              if (!accountName || !accountNumber || !bankName) { toast.error("Please fill in all bank details"); return; }
              if (!amount || parseFloat(amount) <= 0) { toast.error("Please enter a valid amount"); return; }
              const destination = `${bankName} - ${accountNumber} (${accountName})`;
              withdrawMutation.mutate({ method: "bank_wire", currency: bankMethod.currency.split("/")[0], amount, destination, network: bankMethod.id, twoFactorCode: twoFactorCode || undefined, metadata: { bankMethod: bankMethod.id, accountName, accountNumber, bankName, routingCode, region: bankMethod.region } });
            }}
            disabled={withdrawMutation.isPending}
            className="w-full py-3 bg-amber-500 text-black font-semibold rounded-xl hover:bg-amber-400 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {withdrawMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Building2 className="w-4 h-4" />}
            Submit Withdrawal Request
          </button>
        </motion.div>
      )}
    </div>
  );
}

// ─── Card Payout Withdraw ────────────────────────────────────────────────────

function CardPayoutWithdraw({ onSuccess }: { onSuccess: (txHash: string) => void }) {
  const [amount, setAmount] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const withdrawMutation = trpc.transaction.requestWithdrawal.useMutation({
    onSuccess: (data) => onSuccess(data.txHash),
    onError: (err) => toast.error(err.message),
  });

  const formatCardNumber = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(.{4})/g, "$1 ").trim();
  };

  return (
    <div className="space-y-5">
      <div className="bg-card/50 border border-white/5 rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-3 pb-4 border-b border-white/5">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Card Payout</p>
            <p className="text-xs text-muted-foreground">Instant payout to Visa or Mastercard debit card</p>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Cardholder Name</label>
            <input type="text" value={cardName} onChange={(e) => setCardName(e.target.value)} placeholder="John Doe" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/50" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Card Number (Debit only)</label>
            <input type="text" value={cardNumber} onChange={(e) => setCardNumber(formatCardNumber(e.target.value))} placeholder="4242 4242 4242 4242" maxLength={19} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/50 font-mono" />
          </div>
        </div>

        <div>
          <label className="text-xs text-muted-foreground mb-2 block">Amount (USD)</label>
          <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" min="10" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/50" />
          <p className="text-[10px] text-muted-foreground mt-1">Min: $10 | Max: $5,000 per transaction</p>
        </div>

        <div className="bg-white/5 rounded-xl p-4 space-y-2 text-xs">
          <div className="flex justify-between"><span className="text-muted-foreground">Processing Fee</span><span className="text-foreground">1.5%{amount ? ` ($${(parseFloat(amount) * 0.015).toFixed(2)})` : ""}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">You'll receive</span><span className="text-foreground font-medium">{amount ? `$${(parseFloat(amount) * 0.985).toFixed(2)}` : "—"}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Processing Time</span><span className="text-foreground">Instant</span></div>
        </div>

        <div className="flex items-start gap-2 p-3 bg-green-500/5 border border-green-500/20 rounded-xl">
          <Zap className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
          <p className="text-[11px] text-muted-foreground">Card payouts are processed instantly. Funds typically appear on your card within minutes.</p>
        </div>

        <TwoFactorField value={twoFactorCode} onChange={setTwoFactorCode} />

        <button
          onClick={() => {
            if (!cardName) { toast.error("Please enter cardholder name"); return; }
            if (!cardNumber || cardNumber.replace(/\s/g, "").length < 16) { toast.error("Please enter a valid card number"); return; }
            if (!amount || parseFloat(amount) < 10) { toast.error("Minimum withdrawal is $10"); return; }
            const last4 = cardNumber.replace(/\s/g, "").slice(-4);
            withdrawMutation.mutate({ method: "card_payout", currency: "USD", amount, fee: (parseFloat(amount) * 0.015).toFixed(2), destination: `Visa/MC ••••${last4} (${cardName})`, twoFactorCode: twoFactorCode || undefined, metadata: { cardLast4: last4, cardholderName: cardName } });
          }}
          disabled={withdrawMutation.isPending}
          className="w-full py-3 bg-amber-500 text-black font-semibold rounded-xl hover:bg-amber-400 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {withdrawMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
          Withdraw to Card
        </button>
      </div>
    </div>
  );
}

// ─── Mobile Money Withdraw ───────────────────────────────────────────────────

function MobileMoneyWithdraw({ onSuccess }: { onSuccess: (txHash: string) => void }) {
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const withdrawMutation = trpc.transaction.requestWithdrawal.useMutation({
    onSuccess: (data) => onSuccess(data.txHash),
    onError: (err) => toast.error(err.message),
  });

  const provider = mobileOptions.find(m => m.id === selectedProvider);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {mobileOptions.map((method) => (
          <motion.button
            key={method.id}
            whileTap={{ scale: 0.97 }}
            onClick={() => setSelectedProvider(method.id)}
            className={`p-3.5 rounded-xl border transition-all text-left ${selectedProvider === method.id ? "border-amber-500/50 bg-amber-500/5" : "border-white/5 bg-card/50 hover:border-white/10"}`}
          >
            <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${method.color} flex items-center justify-center text-white text-sm mb-2`}>
              <Smartphone className="w-4 h-4" />
            </div>
            <p className="text-xs font-semibold text-foreground">{method.name}</p>
            <p className="text-[10px] text-muted-foreground">{method.region}</p>
          </motion.button>
        ))}
      </div>

      {provider && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card/50 border border-white/5 rounded-2xl p-6 space-y-5">
          <div className="flex items-center gap-3 pb-4 border-b border-white/5">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${provider.color} flex items-center justify-center`}>
              <Smartphone className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{provider.name}</p>
              <p className="text-xs text-muted-foreground">{provider.region}</p>
            </div>
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-2 block">Recipient Name</label>
            <input type="text" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} placeholder="John Doe" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/50" />
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-2 block">Mobile Number</label>
            <input type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="+254 7XX XXX XXX" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/50" />
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-2 block">Amount (USD)</label>
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" min="5" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/50" />
            <p className="text-[10px] text-muted-foreground mt-1">Min: $5 | Max: $5,000 per transaction</p>
          </div>

          <div className="bg-white/5 rounded-xl p-4 space-y-2 text-xs">
            <div className="flex justify-between"><span className="text-muted-foreground">Fee</span><span className="text-foreground">{provider.fee}{amount ? ` ($${(parseFloat(amount) * 0.015).toFixed(2)})` : ""}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">You'll receive</span><span className="text-foreground font-medium">{amount ? `$${(parseFloat(amount) * 0.985).toFixed(2)}` : "—"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Processing Time</span><span className="text-foreground">{provider.time}</span></div>
          </div>

          <TwoFactorField value={twoFactorCode} onChange={setTwoFactorCode} />

          <button
            onClick={() => {
              if (!recipientName) { toast.error("Please enter recipient name"); return; }
              if (!phoneNumber) { toast.error("Please enter mobile number"); return; }
              if (!amount || parseFloat(amount) < 5) { toast.error("Minimum withdrawal is $5"); return; }
              withdrawMutation.mutate({ method: "mobile_money", currency: "USD", amount, fee: (parseFloat(amount) * 0.015).toFixed(2), destination: `${provider.name} - ${phoneNumber} (${recipientName})`, twoFactorCode: twoFactorCode || undefined, metadata: { provider: provider.id, phoneNumber, recipientName, region: provider.region } });
            }}
            disabled={withdrawMutation.isPending}
            className="w-full py-3 bg-amber-500 text-black font-semibold rounded-xl hover:bg-amber-400 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {withdrawMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Smartphone className="w-4 h-4" />}
            Send to {provider.name}
          </button>
        </motion.div>
      )}
    </div>
  );
}
