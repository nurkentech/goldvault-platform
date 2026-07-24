import { useState } from "react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  RefreshCw, ArrowUpRight, Building2, CreditCard, Globe, Zap,
  CheckCircle, Clock, AlertCircle, TrendingUp, TrendingDown, DollarSign, Coins
} from "lucide-react";

// Live Exchange Rates
const exchangeRates = [
  { pair: "XAU/USD", name: "Gold / US Dollar", rate: 3285.42, change: +1.23, bid: 3284.10, ask: 3286.74, spread: 2.64, type: "commodity" },
  { pair: "BTC/USD", name: "Bitcoin / US Dollar", rate: 67420.00, change: +2.45, bid: 67398.00, ask: 67442.00, spread: 44.00, type: "crypto" },
  { pair: "ETH/USD", name: "Ethereum / US Dollar", rate: 3842.50, change: +1.87, bid: 3840.20, ask: 3844.80, spread: 4.60, type: "crypto" },
  { pair: "BTC/XAU", name: "Bitcoin / Gold (oz)", rate: 20.52, change: +1.18, bid: 20.50, ask: 20.54, spread: 0.04, type: "cross" },
  { pair: "ETH/XAU", name: "Ethereum / Gold (oz)", rate: 1.169, change: +0.62, bid: 1.168, ask: 1.170, spread: 0.002, type: "cross" },
  { pair: "PAXG/USD", name: "PAX Gold / US Dollar", rate: 3285.00, change: +2.14, bid: 3283.50, ask: 3286.50, spread: 3.00, type: "token" },
  { pair: "XAU/EUR", name: "Gold / Euro", rate: 3042.18, change: +0.98, bid: 3040.50, ask: 3043.86, spread: 3.36, type: "forex" },
  { pair: "XAU/GBP", name: "Gold / British Pound", rate: 2598.34, change: +1.05, bid: 2596.80, ask: 2599.88, spread: 3.08, type: "forex" },
  { pair: "XAU/JPY", name: "Gold / Japanese Yen", rate: 512840.00, change: +0.87, bid: 512500.00, ask: 513180.00, spread: 680.00, type: "forex" },
  { pair: "XAU/AUD", name: "Gold / Australian Dollar", rate: 5124.60, change: +1.34, bid: 5121.20, ask: 5128.00, spread: 6.80, type: "forex" },
  { pair: "SOL/USD", name: "Solana / US Dollar", rate: 182.30, change: +4.12, bid: 182.10, ask: 182.50, spread: 0.40, type: "crypto" },
  { pair: "BNB/USD", name: "BNB / US Dollar", rate: 612.40, change: +1.23, bid: 611.80, ask: 613.00, spread: 1.20, type: "crypto" },
];

// Withdrawal Methods
const withdrawalMethods = [
  {
    id: "crypto_wallet",
    name: "Crypto Wallet",
    icon: "₿",
    description: "Send to any external wallet address",
    fee: "0.1% + network gas",
    minAmount: "$10",
    maxAmount: "$500,000",
    processingTime: "5–30 minutes",
    availability: "24/7",
    supported: ["BTC", "ETH", "SOL", "USDT", "BNB", "XRP", "ADA", "MATIC"],
    badge: "Instant",
    badgeColor: "bg-green-500/20 text-green-400 border-green-500/30",
  },
  {
    id: "ach_us",
    name: "ACH Transfer (US)",
    icon: "🏦",
    description: "Direct bank transfer for US accounts",
    fee: "Free (standard) / $5 (same-day)",
    minAmount: "$10",
    maxAmount: "$25,000/day",
    processingTime: "1–3 business days",
    availability: "Mon–Fri 9am–5pm EST",
    supported: ["USD"],
    badge: "Free",
    badgeColor: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  },
  {
    id: "wire_international",
    name: "International Wire (SWIFT)",
    icon: "🌍",
    description: "SWIFT wire to any bank worldwide",
    fee: "$25 flat fee",
    minAmount: "$500",
    maxAmount: "$10,000,000",
    processingTime: "1–5 business days",
    availability: "Mon–Fri",
    supported: ["USD", "EUR", "GBP", "JPY", "AUD", "CAD", "CHF"],
    badge: "Global",
    badgeColor: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  },
  {
    id: "sepa",
    name: "SEPA Transfer (EU)",
    icon: "🇪🇺",
    description: "Euro transfers within SEPA zone",
    fee: "€0.50",
    minAmount: "€10",
    maxAmount: "€100,000",
    processingTime: "Same day / next day",
    availability: "Mon–Fri",
    supported: ["EUR"],
    badge: "EU",
    badgeColor: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  },
  {
    id: "faster_payments",
    name: "Faster Payments (UK)",
    icon: "🇬🇧",
    description: "Instant GBP transfers within UK",
    fee: "Free",
    minAmount: "£10",
    maxAmount: "£250,000",
    processingTime: "Instant",
    availability: "24/7",
    supported: ["GBP"],
    badge: "Instant",
    badgeColor: "bg-green-500/20 text-green-400 border-green-500/30",
  },
  {
    id: "debit_card",
    name: "Debit Card Payout",
    icon: "💳",
    description: "Instant payout to Visa/Mastercard debit",
    fee: "1.5%",
    minAmount: "$10",
    maxAmount: "$5,000",
    processingTime: "Instant",
    availability: "24/7",
    supported: ["USD", "EUR", "GBP"],
    badge: "Instant",
    badgeColor: "bg-green-500/20 text-green-400 border-green-500/30",
  },
];

// Recent Transactions
const recentTransactions = [
  { id: "TXN001", type: "withdrawal", method: "ACH Transfer", amount: 2500.00, currency: "USD", status: "completed", date: "2026-06-24", fee: 0, destination: "Chase Bank ••••4821" },
  { id: "TXN002", type: "deposit", method: "Bitcoin", amount: 0.0842, currency: "BTC", status: "completed", date: "2026-06-23", fee: 0.0001, destination: "GoldVaults Wallet" },
  { id: "TXN003", type: "withdrawal", method: "SWIFT Wire", amount: 10000.00, currency: "USD", status: "pending", date: "2026-06-22", fee: 25.00, destination: "HSBC London ••••7734" },
  { id: "TXN004", type: "withdrawal", method: "Crypto Wallet", amount: 500.00, currency: "USDT", status: "completed", date: "2026-06-21", fee: 1.50, destination: "0x7a3F...9D2e" },
  { id: "TXN005", type: "deposit", method: "SEPA", amount: 5000.00, currency: "EUR", status: "completed", date: "2026-06-20", fee: 0.50, destination: "GoldVaults EUR Wallet" },
];

const typeColors: Record<string, string> = {
  commodity: "text-amber-400",
  crypto: "text-blue-400",
  cross: "text-purple-400",
  token: "text-green-400",
  forex: "text-slate-300",
};

const statusConfig: Record<string, { color: string; icon: React.ReactNode }> = {
  completed: { color: "text-green-400", icon: <CheckCircle className="w-4 h-4" /> },
  pending: { color: "text-yellow-400", icon: <Clock className="w-4 h-4" /> },
  failed: { color: "text-red-400", icon: <AlertCircle className="w-4 h-4" /> },
};

export default function ExchangeWithdrawal() {
  const [activeTab, setActiveTab] = useState("rates");
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawAddress, setWithdrawAddress] = useState("");
  const [withdrawCurrency, setWithdrawCurrency] = useState("USD");
  const [rateFilter, setRateFilter] = useState("all");
  const [submitted, setSubmitted] = useState(false);

  const filteredRates = rateFilter === "all" ? exchangeRates : exchangeRates.filter(r => r.type === rateFilter);

  const handleWithdraw = () => {
    if (!withdrawAmount || !withdrawAddress || !selectedMethod) return;
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="space-y-8 py-8">
      <div>
        <h2 className="text-3xl font-bold text-white">Exchange & Withdrawals</h2>
        <p className="text-slate-400 mt-1">Live rates, international transfers, and crypto payouts</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-blue-900/50 border border-blue-800/50 mb-6">
          <TabsTrigger value="rates" className="data-[state=active]:bg-amber-500 data-[state=active]:text-white text-slate-300">
            <TrendingUp className="w-4 h-4 mr-2" /> Live Exchange Rates
          </TabsTrigger>
          <TabsTrigger value="withdraw" className="data-[state=active]:bg-amber-500 data-[state=active]:text-white text-slate-300">
            <ArrowUpRight className="w-4 h-4 mr-2" /> Withdraw & Payout
          </TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:bg-amber-500 data-[state=active]:text-white text-slate-300">
            <Clock className="w-4 h-4 mr-2" /> Transaction History
          </TabsTrigger>
        </TabsList>

        {/* Exchange Rates Tab */}
        <TabsContent value="rates">
          <div className="space-y-4">
            {/* Filter */}
            <div className="flex items-center gap-2 flex-wrap">
              {["all", "commodity", "crypto", "token", "forex", "cross"].map(f => (
                <button key={f} onClick={() => setRateFilter(f)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition ${rateFilter === f ? "bg-amber-500 text-white" : "bg-blue-900/40 text-slate-300 hover:bg-blue-900/60 border border-blue-800/50"}`}>
                  {f === "all" ? "All Pairs" : f}
                </button>
              ))}
              <button onClick={() => toast.info("Rates refreshed", { description: "Exchange rates are live and update every 5 seconds." })} className="ml-auto flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-400 hover:text-white border border-blue-800/50 rounded-full transition">
                <RefreshCw className="w-3 h-3" /> Live · Updates every 5s
              </button>
            </div>

            <Card className="bg-blue-900/20 border-blue-800/40 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-blue-800/50">
                      <th className="text-left p-4 text-slate-400 text-sm font-medium">Pair</th>
                      <th className="text-right p-4 text-slate-400 text-sm font-medium">Rate</th>
                      <th className="text-right p-4 text-slate-400 text-sm font-medium">Bid</th>
                      <th className="text-right p-4 text-slate-400 text-sm font-medium">Ask</th>
                      <th className="text-right p-4 text-slate-400 text-sm font-medium">Spread</th>
                      <th className="text-right p-4 text-slate-400 text-sm font-medium">24h Change</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRates.map((rate, i) => (
                      <tr key={i} className="border-b border-blue-800/30 hover:bg-blue-900/30 transition">
                        <td className="p-4">
                          <div>
                            <p className={`font-bold text-sm ${typeColors[rate.type]}`}>{rate.pair}</p>
                            <p className="text-slate-500 text-xs">{rate.name}</p>
                          </div>
                        </td>
                        <td className="p-4 text-right text-white font-semibold text-sm">
                          {rate.rate >= 1000 ? rate.rate.toLocaleString("en-US", { minimumFractionDigits: 2 }) : rate.rate.toFixed(4)}
                        </td>
                        <td className="p-4 text-right text-slate-300 text-sm">
                          {rate.bid >= 1000 ? rate.bid.toLocaleString("en-US", { minimumFractionDigits: 2 }) : rate.bid.toFixed(4)}
                        </td>
                        <td className="p-4 text-right text-slate-300 text-sm">
                          {rate.ask >= 1000 ? rate.ask.toLocaleString("en-US", { minimumFractionDigits: 2 }) : rate.ask.toFixed(4)}
                        </td>
                        <td className="p-4 text-right text-slate-400 text-sm">
                          {rate.spread >= 1 ? rate.spread.toFixed(2) : rate.spread.toFixed(4)}
                        </td>
                        <td className="p-4 text-right">
                          <span className={`text-sm font-semibold flex items-center justify-end gap-1 ${rate.change >= 0 ? "text-green-400" : "text-red-400"}`}>
                            {rate.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {rate.change >= 0 ? "+" : ""}{rate.change}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Withdrawal Tab */}
        <TabsContent value="withdraw">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Method Selection */}
            <div className="space-y-4">
              <h3 className="text-white font-semibold text-lg">Select Payout Method</h3>
              <div className="space-y-3">
                {withdrawalMethods.map(method => (
                  <Card key={method.id}
                    onClick={() => setSelectedMethod(method.id)}
                    className={`p-4 cursor-pointer transition ${selectedMethod === method.id ? "border-amber-500/60 bg-amber-500/10" : "border-blue-800/50 bg-blue-900/20 hover:border-blue-700/70 hover:bg-blue-900/40"}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{method.icon}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-white font-semibold text-sm">{method.name}</p>
                            <Badge className={`text-xs ${method.badgeColor}`}>{method.badge}</Badge>
                          </div>
                          <p className="text-slate-400 text-xs mt-0.5">{method.description}</p>
                        </div>
                      </div>
                      {selectedMethod === method.id && <CheckCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />}
                    </div>
                    <div className="grid grid-cols-3 gap-3 mt-3 text-xs">
                      <div>
                        <p className="text-slate-500">Fee</p>
                        <p className="text-slate-300">{method.fee}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Processing</p>
                        <p className="text-slate-300">{method.processingTime}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Max</p>
                        <p className="text-slate-300">{method.maxAmount}</p>
                      </div>
                    </div>
                    <div className="flex gap-1 mt-2">
                      {method.supported.map(c => (
                        <span key={c} className="text-xs px-1.5 py-0.5 bg-blue-900/50 text-slate-400 rounded border border-blue-800/30">{c}</span>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Withdrawal Form */}
            <div className="space-y-4">
              <h3 className="text-white font-semibold text-lg">Withdrawal Details</h3>
              <Card className="p-6 bg-blue-900/20 border-blue-800/40 space-y-5">
                {/* Amount */}
                <div>
                  <label className="text-slate-400 text-sm block mb-2">Amount</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={withdrawAmount}
                      onChange={e => setWithdrawAmount(e.target.value)}
                      placeholder="0.00"
                      className="flex-1 bg-blue-950/50 border border-blue-800/50 rounded-lg px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/50 text-sm"
                    />
                    <select
                      value={withdrawCurrency}
                      onChange={e => setWithdrawCurrency(e.target.value)}
                      className="bg-blue-950/50 border border-blue-800/50 rounded-lg px-3 py-3 text-white focus:outline-none focus:border-amber-500/50 text-sm"
                    >
                      <option>USD</option>
                      <option>EUR</option>
                      <option>GBP</option>
                      <option>BTC</option>
                      <option>ETH</option>
                      <option>USDT</option>
                      <option>XAU</option>
                    </select>
                  </div>
                  <p className="text-slate-500 text-xs mt-1">Available: $12,864.20 USD equivalent</p>
                </div>

                {/* Destination */}
                <div>
                  <label className="text-slate-400 text-sm block mb-2">
                    {selectedMethod === "crypto_wallet" ? "Wallet Address" : "Bank Account / IBAN / Routing"}
                  </label>
                  <input
                    type="text"
                    value={withdrawAddress}
                    onChange={e => setWithdrawAddress(e.target.value)}
                    placeholder={selectedMethod === "crypto_wallet" ? "0x... or bc1... or wallet address" : "Account number, IBAN, or routing info"}
                    className="w-full bg-blue-950/50 border border-blue-800/50 rounded-lg px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/50 text-sm font-mono"
                  />
                </div>

                {/* Bank Details (for wire) */}
                {selectedMethod === "wire_international" && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-slate-400 text-sm block mb-2">Bank Name</label>
                      <input type="text" placeholder="e.g. HSBC, Barclays, JPMorgan" className="w-full bg-blue-950/50 border border-blue-800/50 rounded-lg px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/50 text-sm" />
                    </div>
                    <div>
                      <label className="text-slate-400 text-sm block mb-2">SWIFT / BIC Code</label>
                      <input type="text" placeholder="e.g. HBUKGB4B" className="w-full bg-blue-950/50 border border-blue-800/50 rounded-lg px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/50 text-sm font-mono" />
                    </div>
                    <div>
                      <label className="text-slate-400 text-sm block mb-2">Beneficiary Name</label>
                      <input type="text" placeholder="Full legal name" className="w-full bg-blue-950/50 border border-blue-800/50 rounded-lg px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/50 text-sm" />
                    </div>
                    <div>
                      <label className="text-slate-400 text-sm block mb-2">Country</label>
                      <select className="w-full bg-blue-950/50 border border-blue-800/50 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500/50 text-sm">
                        <option>United States</option>
                        <option>United Kingdom</option>
                        <option>Germany</option>
                        <option>France</option>
                        <option>Australia</option>
                        <option>Canada</option>
                        <option>Japan</option>
                        <option>Singapore</option>
                        <option>UAE</option>
                        <option>Other</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Fee Summary */}
                {selectedMethod && withdrawAmount && (
                  <Card className="p-4 bg-blue-950/50 border border-blue-800/30 space-y-2 text-sm">
                    <div className="flex justify-between text-slate-400">
                      <span>Amount</span>
                      <span className="text-white">{withdrawAmount} {withdrawCurrency}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Network / Processing Fee</span>
                      <span className="text-amber-400">{withdrawalMethods.find(m => m.id === selectedMethod)?.fee}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Processing Time</span>
                      <span className="text-green-400">{withdrawalMethods.find(m => m.id === selectedMethod)?.processingTime}</span>
                    </div>
                    <div className="border-t border-blue-800/40 pt-2 flex justify-between">
                      <span className="text-white font-semibold">You Receive</span>
                      <span className="text-amber-400 font-bold">{withdrawAmount} {withdrawCurrency} (approx.)</span>
                    </div>
                  </Card>
                )}

                {/* Submit */}
                <button
                  onClick={handleWithdraw}
                  disabled={!selectedMethod || !withdrawAmount || !withdrawAddress}
                  className={`w-full py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
                    submitted ? "bg-green-500 text-white" :
                    !selectedMethod || !withdrawAmount || !withdrawAddress
                      ? "bg-blue-900/40 text-slate-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white"
                  }`}
                >
                  {submitted ? (
                    <><CheckCircle className="w-5 h-5" /> Withdrawal Submitted!</>
                  ) : (
                    <><ArrowUpRight className="w-5 h-5" /> Submit Withdrawal</>
                  )}
                </button>

                <p className="text-slate-500 text-xs text-center">
                  All withdrawals require 2FA verification. Funds are typically released within the stated processing time after identity confirmation.
                </p>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Transaction History Tab */}
        <TabsContent value="history">
          <Card className="bg-blue-900/20 border-blue-800/40 overflow-hidden">
            <div className="p-4 border-b border-blue-800/50 flex items-center justify-between">
              <h3 className="text-white font-semibold">Recent Transactions</h3>
              <button onClick={() => toast.info("Sign up to view full history", { description: "Create a free account to access your complete transaction history." })} className="text-xs text-amber-400 hover:text-amber-300 transition">View All →</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-blue-800/40">
                    <th className="text-left p-4 text-slate-400 text-sm font-medium">Transaction</th>
                    <th className="text-left p-4 text-slate-400 text-sm font-medium">Method</th>
                    <th className="text-right p-4 text-slate-400 text-sm font-medium">Amount</th>
                    <th className="text-right p-4 text-slate-400 text-sm font-medium">Fee</th>
                    <th className="text-left p-4 text-slate-400 text-sm font-medium">Destination</th>
                    <th className="text-left p-4 text-slate-400 text-sm font-medium">Date</th>
                    <th className="text-left p-4 text-slate-400 text-sm font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTransactions.map((tx, i) => (
                    <tr key={i} className="border-b border-blue-800/30 hover:bg-blue-900/30 transition">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${tx.type === "withdrawal" ? "bg-red-500/20" : "bg-green-500/20"}`}>
                            {tx.type === "withdrawal" ? <ArrowUpRight className="w-4 h-4 text-red-400" /> : <DollarSign className="w-4 h-4 text-green-400" />}
                          </div>
                          <div>
                            <p className="text-white text-sm font-semibold capitalize">{tx.type}</p>
                            <p className="text-slate-500 text-xs font-mono">{tx.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-slate-300 text-sm">{tx.method}</td>
                      <td className="p-4 text-right">
                        <span className={`font-semibold text-sm ${tx.type === "withdrawal" ? "text-red-400" : "text-green-400"}`}>
                          {tx.type === "withdrawal" ? "-" : "+"}{tx.amount.toLocaleString()} {tx.currency}
                        </span>
                      </td>
                      <td className="p-4 text-right text-slate-400 text-sm">{tx.fee > 0 ? `${tx.fee} ${tx.currency}` : "Free"}</td>
                      <td className="p-4 text-slate-300 text-sm font-mono text-xs">{tx.destination}</td>
                      <td className="p-4 text-slate-400 text-sm">{tx.date}</td>
                      <td className="p-4">
                        <span className={`flex items-center gap-1.5 text-sm font-semibold ${statusConfig[tx.status].color}`}>
                          {statusConfig[tx.status].icon}
                          <span className="capitalize">{tx.status}</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Supported Banks & Networks */}
          <div className="grid md:grid-cols-3 gap-4 mt-6">
            {[
              { title: "US Banking Networks", icon: <Building2 className="w-5 h-5 text-blue-400" />, items: ["ACH (Automated Clearing House)", "Fedwire (Same-Day)", "CHIPS (Large Value)", "Zelle (Instant P2P)", "The Clearing House (TCH)"] },
              { title: "International Networks", icon: <Globe className="w-5 h-5 text-purple-400" />, items: ["SWIFT (200+ countries)", "SEPA (EU/EEA)", "Faster Payments (UK)", "BACS (UK Direct Debit)", "CHAPS (UK Same-Day)"] },
              { title: "Crypto Networks", icon: <Coins className="w-5 h-5 text-amber-400" />, items: ["Bitcoin (BTC) Network", "Ethereum (ERC-20)", "Solana (SPL Tokens)", "BNB Smart Chain (BEP-20)", "Polygon (MATIC)"] },
            ].map((section, i) => (
              <Card key={i} className="p-5 bg-blue-900/20 border-blue-800/40">
                <div className="flex items-center gap-2 mb-3">
                  {section.icon}
                  <h4 className="text-white font-semibold text-sm">{section.title}</h4>
                </div>
                <ul className="space-y-1.5">
                  {section.items.map((item, j) => (
                    <li key={j} className="flex items-center gap-2 text-slate-400 text-xs">
                      <Zap className="w-3 h-3 text-amber-400 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
