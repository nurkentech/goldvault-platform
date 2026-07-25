import { useState } from "react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";
import {
  Wallet, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownLeft,
  RefreshCw, Eye, EyeOff, Copy, CheckCircle, BarChart3, Coins, Shield
} from "lucide-react";

// Gold ETF Holdings
const goldETFs = [
  { symbol: "GLD", name: "SPDR Gold Shares", shares: 12.5, price: 218.42, change: +1.23, value: 2730.25, yield: 0, type: "ETF", custodian: "State Street", backed: "Physical Gold" },
  { symbol: "IAU", name: "iShares Gold Trust", shares: 45.0, price: 39.18, change: +0.98, value: 1763.10, yield: 0, type: "ETF", custodian: "BlackRock", backed: "Physical Gold" },
  { symbol: "GLDM", name: "SPDR Gold MiniShares", shares: 80.0, price: 21.84, change: +1.15, value: 1747.20, yield: 0, type: "ETF", custodian: "State Street", backed: "Physical Gold" },
  { symbol: "SGOL", name: "Aberdeen Physical Gold", shares: 20.0, price: 27.62, change: +0.87, value: 552.40, yield: 0, type: "ETF", custodian: "Aberdeen", backed: "Swiss Vault Gold" },
  { symbol: "AAAU", name: "Goldman Sachs Physical Gold", shares: 15.0, price: 21.95, change: +1.02, value: 329.25, yield: 0, type: "ETF", custodian: "Goldman Sachs", backed: "Physical Gold" },
  { symbol: "PAXG", name: "PAX Gold Token", shares: 0.5, price: 3285.00, change: +2.14, value: 1642.50, yield: 2.5, type: "Token", custodian: "Paxos", backed: "LBMA Gold" },
  { symbol: "XAUT", name: "Tether Gold", shares: 0.3, price: 3290.00, change: +2.08, value: 987.00, yield: 1.8, type: "Token", custodian: "Tether", backed: "Swiss Gold" },
  { symbol: "GVT", name: "GoldVaults Token", shares: 250.0, price: 12.45, change: +3.21, value: 3112.50, yield: 4.5, type: "Native", custodian: "GoldVaults", backed: "Mining Royalties" },
];

// Crypto Balances
const cryptoBalances = [
  { symbol: "BTC", name: "Bitcoin", balance: 0.0842, price: 67420.00, change: +2.45, value: 5676.77, icon: "₿", color: "#F7931A" },
  { symbol: "ETH", name: "Ethereum", balance: 1.245, price: 3842.50, change: +1.87, value: 4783.91, icon: "Ξ", color: "#627EEA" },
  { symbol: "SOL", name: "Solana", balance: 12.5, price: 182.30, change: +4.12, value: 2278.75, icon: "◎", color: "#9945FF" },
  { symbol: "USDT", name: "Tether USD", balance: 5000.00, price: 1.00, change: 0.00, value: 5000.00, icon: "₮", color: "#26A17B" },
  { symbol: "BNB", name: "BNB Chain", balance: 3.2, price: 612.40, change: +1.23, value: 1959.68, icon: "⬡", color: "#F3BA2F" },
  { symbol: "XRP", name: "Ripple", balance: 850.0, price: 0.6842, change: -0.54, value: 581.57, icon: "✕", color: "#00AAE4" },
  { symbol: "ADA", name: "Cardano", balance: 1200.0, price: 0.4521, change: +0.89, value: 542.52, icon: "₳", color: "#0033AD" },
  { symbol: "MATIC", name: "Polygon", balance: 500.0, price: 0.8234, change: +2.31, value: 411.70, icon: "⬡", color: "#8247E5" },
  { symbol: "AVAX", name: "Avalanche", balance: 8.5, price: 38.92, change: -1.12, value: 330.82, icon: "▲", color: "#E84142" },
  { symbol: "DOT", name: "Polkadot", balance: 45.0, price: 7.84, change: +0.67, value: 352.80, icon: "●", color: "#E6007A" },
];

// Portfolio history
const portfolioHistory = [
  { date: "Jan", gold: 8200, crypto: 9800, total: 18000 },
  { date: "Feb", gold: 8900, crypto: 10200, total: 19100 },
  { date: "Mar", gold: 9400, crypto: 9600, total: 19000 },
  { date: "Apr", gold: 10100, crypto: 11400, total: 21500 },
  { date: "May", gold: 11200, crypto: 12800, total: 24000 },
  { date: "Jun", gold: 12864, crypto: 14919, total: 27783 },
];

const PIE_COLORS = ["#F59E0B", "#3B82F6", "#8B5CF6", "#10B981", "#EF4444", "#F97316", "#06B6D4", "#84CC16"];

export default function WalletDashboard() {
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [activeWalletTab, setActiveWalletTab] = useState("gold");

  const totalGoldValue = goldETFs.reduce((sum, etf) => sum + etf.value, 0);
  const totalCryptoValue = cryptoBalances.reduce((sum, c) => sum + c.value, 0);
  const totalPortfolio = totalGoldValue + totalCryptoValue;
  const totalYield = goldETFs.filter(e => e.yield > 0).reduce((sum, e) => sum + (e.value * e.yield / 100), 0);

  const walletAddress = "0xGV7a3F9b2C1d4E8f5A0B6c9D2e3F4a5B6c7D8e9F";

  const handleCopy = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  const pieData = [
    { name: "Gold ETFs", value: totalGoldValue },
    { name: "Crypto", value: totalCryptoValue },
  ];

  return (
    <div className="space-y-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">My Wallet</h2>
          <p className="text-slate-400 mt-1">Gold ETFs, Tokens & Cryptocurrency Portfolio</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setBalanceVisible(!balanceVisible)} className="p-2 rounded-lg bg-blue-900/40 border border-blue-800/50 text-slate-400 hover:text-white transition">
            {balanceVisible ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
          </button>
          <button onClick={() => toast.info("Refreshing portfolio...", { description: "Prices updated." })} className="p-2 rounded-lg bg-blue-900/40 border border-blue-800/50 text-slate-400 hover:text-white transition">
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Total Portfolio Value */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="md:col-span-2 p-6 bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/30">
          <p className="text-slate-400 text-sm mb-1">Total Portfolio Value</p>
          <p className="text-4xl font-bold text-white">
            {balanceVisible ? `$${totalPortfolio.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "••••••••"}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-green-400 text-sm font-semibold">+$2,847.32 (11.4%) this month</span>
          </div>
        </Card>
        <Card className="p-6 bg-blue-900/30 border-blue-800/50">
          <p className="text-slate-400 text-sm mb-1">Gold ETF Holdings</p>
          <p className="text-2xl font-bold text-amber-400">
            {balanceVisible ? `$${totalGoldValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}` : "••••••"}
          </p>
          <p className="text-slate-400 text-xs mt-1">{((totalGoldValue / totalPortfolio) * 100).toFixed(1)}% of portfolio</p>
        </Card>
        <Card className="p-6 bg-blue-900/30 border-blue-800/50">
          <p className="text-slate-400 text-sm mb-1">Crypto Holdings</p>
          <p className="text-2xl font-bold text-blue-400">
            {balanceVisible ? `$${totalCryptoValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}` : "••••••"}
          </p>
          <p className="text-slate-400 text-xs mt-1">{((totalCryptoValue / totalPortfolio) * 100).toFixed(1)}% of portfolio</p>
        </Card>
      </div>

      {/* Wallet Address */}
      <Card className="p-4 bg-blue-900/20 border border-blue-800/40">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-slate-400 text-xs">GoldVaults Wallet Address</p>
              <p className="text-white font-mono text-sm">{balanceVisible ? walletAddress : "0xGV••••••••••••••••••••••••••••••"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Active</Badge>
            <button onClick={handleCopy} className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 rounded-lg text-sm transition">
              {copiedAddress ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copiedAddress ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>
      </Card>

      {/* Portfolio Chart + Allocation */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 p-6 bg-blue-900/30 border-blue-800/50">
          <h3 className="text-white font-semibold mb-4">Portfolio Performance (6 Months)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={portfolioHistory}>
              <defs>
                <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="cryptoGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5f" />
              <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 12 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 12 }} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, ""]} contentStyle={{ background: "#0f172a", border: "1px solid #1e3a5f", borderRadius: "8px" }} />
              <Area type="monotone" dataKey="gold" stroke="#F59E0B" fill="url(#goldGrad)" strokeWidth={2} name="Gold ETFs" />
              <Area type="monotone" dataKey="crypto" stroke="#3B82F6" fill="url(#cryptoGrad)" strokeWidth={2} name="Crypto" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
        <Card className="p-6 bg-blue-900/30 border-blue-800/50">
          <h3 className="text-white font-semibold mb-4">Allocation</h3>
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" stroke="none">
                {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
              </Pie>
              <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, ""]} contentStyle={{ background: "#0f172a", border: "1px solid #1e3a5f", borderRadius: "8px" }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {pieData.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: PIE_COLORS[i] }} />
                  <span className="text-slate-300">{item.name}</span>
                </div>
                <span className="text-white font-semibold">{((item.value / totalPortfolio) * 100).toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Holdings Tabs */}
      <Tabs value={activeWalletTab} onValueChange={setActiveWalletTab}>
        <TabsList className="bg-blue-900/50 border border-blue-800/50 mb-6">
          <TabsTrigger value="gold" className="data-[state=active]:bg-amber-500 data-[state=active]:text-white text-slate-300">
            <BarChart3 className="w-4 h-4 mr-2" /> Gold ETFs & Tokens
          </TabsTrigger>
          <TabsTrigger value="crypto" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white text-slate-300">
            <Coins className="w-4 h-4 mr-2" /> Cryptocurrency
          </TabsTrigger>
        </TabsList>

        {/* Gold ETFs Tab */}
        <TabsContent value="gold">
          <Card className="bg-blue-900/20 border-blue-800/40 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-blue-800/50">
                    <th className="text-left p-4 text-slate-400 text-sm font-medium">Asset</th>
                    <th className="text-right p-4 text-slate-400 text-sm font-medium">Shares</th>
                    <th className="text-right p-4 text-slate-400 text-sm font-medium">Price</th>
                    <th className="text-right p-4 text-slate-400 text-sm font-medium">24h</th>
                    <th className="text-right p-4 text-slate-400 text-sm font-medium">Value</th>
                    <th className="text-right p-4 text-slate-400 text-sm font-medium">Yield</th>
                    <th className="text-right p-4 text-slate-400 text-sm font-medium">Type</th>
                  </tr>
                </thead>
                <tbody>
                  {goldETFs.map((etf, i) => (
                    <tr key={i} className="border-b border-blue-800/30 hover:bg-blue-900/30 transition">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500/30 to-amber-600/20 flex items-center justify-center text-amber-400 font-bold text-xs border border-amber-500/20">
                            {etf.symbol.slice(0, 2)}
                          </div>
                          <div>
                            <p className="text-white font-semibold text-sm">{etf.symbol}</p>
                            <p className="text-slate-400 text-xs">{etf.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-right text-white text-sm">{balanceVisible ? etf.shares.toFixed(4) : "••••"}</td>
                      <td className="p-4 text-right text-white text-sm">${etf.price.toLocaleString()}</td>
                      <td className="p-4 text-right">
                        <span className={`text-sm font-semibold flex items-center justify-end gap-1 ${etf.change >= 0 ? "text-green-400" : "text-red-400"}`}>
                          {etf.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {etf.change >= 0 ? "+" : ""}{etf.change}%
                        </span>
                      </td>
                      <td className="p-4 text-right text-amber-400 font-semibold text-sm">
                        {balanceVisible ? `$${etf.value.toLocaleString("en-US", { minimumFractionDigits: 2 })}` : "••••••"}
                      </td>
                      <td className="p-4 text-right">
                        <span className={`text-sm font-semibold ${etf.yield > 0 ? "text-green-400" : "text-slate-500"}`}>
                          {etf.yield > 0 ? `${etf.yield}% APY` : "—"}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <Badge className={`text-xs ${etf.type === "ETF" ? "bg-blue-500/20 text-blue-400 border-blue-500/30" : etf.type === "Token" ? "bg-purple-500/20 text-purple-400 border-purple-500/30" : "bg-amber-500/20 text-amber-400 border-amber-500/30"}`}>
                          {etf.type}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-blue-950/50">
                    <td colSpan={4} className="p-4 text-slate-400 text-sm font-medium">Total Gold Portfolio</td>
                    <td className="p-4 text-right text-amber-400 font-bold">
                      {balanceVisible ? `$${totalGoldValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}` : "••••••"}
                    </td>
                    <td className="p-4 text-right text-green-400 font-semibold text-sm">
                      ${totalYield.toFixed(2)}/yr
                    </td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* Crypto Tab */}
        <TabsContent value="crypto">
          <Card className="bg-blue-900/20 border-blue-800/40 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-blue-800/50">
                    <th className="text-left p-4 text-slate-400 text-sm font-medium">Asset</th>
                    <th className="text-right p-4 text-slate-400 text-sm font-medium">Balance</th>
                    <th className="text-right p-4 text-slate-400 text-sm font-medium">Price</th>
                    <th className="text-right p-4 text-slate-400 text-sm font-medium">24h</th>
                    <th className="text-right p-4 text-slate-400 text-sm font-medium">Value (USD)</th>
                    <th className="text-right p-4 text-slate-400 text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {cryptoBalances.map((coin, i) => (
                    <tr key={i} className="border-b border-blue-800/30 hover:bg-blue-900/30 transition">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ background: coin.color + "33", border: `1px solid ${coin.color}44` }}>
                            <span style={{ color: coin.color }}>{coin.icon}</span>
                          </div>
                          <div>
                            <p className="text-white font-semibold text-sm">{coin.symbol}</p>
                            <p className="text-slate-400 text-xs">{coin.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-right text-white text-sm font-mono">
                        {balanceVisible ? coin.balance.toLocaleString("en-US", { maximumFractionDigits: 6 }) : "••••••"}
                      </td>
                      <td className="p-4 text-right text-white text-sm">
                        ${coin.price >= 1000 ? coin.price.toLocaleString() : coin.price.toFixed(4)}
                      </td>
                      <td className="p-4 text-right">
                        <span className={`text-sm font-semibold flex items-center justify-end gap-1 ${coin.change > 0 ? "text-green-400" : coin.change < 0 ? "text-red-400" : "text-slate-400"}`}>
                          {coin.change > 0 ? <TrendingUp className="w-3 h-3" /> : coin.change < 0 ? <TrendingDown className="w-3 h-3" /> : null}
                          {coin.change > 0 ? "+" : ""}{coin.change}%
                        </span>
                      </td>
                      <td className="p-4 text-right text-blue-400 font-semibold text-sm">
                        {balanceVisible ? `$${coin.value.toLocaleString("en-US", { minimumFractionDigits: 2 })}` : "••••••"}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => toast.info("Sign up to receive", { description: "Create a free account to receive crypto." })} className="px-2 py-1 text-xs bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 rounded transition">
                            <ArrowDownLeft className="w-3 h-3 inline mr-1" />Receive
                          </button>
                          <button onClick={() => toast.info("Sign up to send", { description: "Create a free account to send crypto." })} className="px-2 py-1 text-xs bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 rounded transition">
                            <ArrowUpRight className="w-3 h-3 inline mr-1" />Send
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-blue-950/50">
                    <td colSpan={4} className="p-4 text-slate-400 text-sm font-medium">Total Crypto Portfolio</td>
                    <td className="p-4 text-right text-blue-400 font-bold">
                      {balanceVisible ? `$${totalCryptoValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}` : "••••••"}
                    </td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Security Notice */}
      <Card className="p-4 bg-blue-950/50 border border-blue-800/30 flex items-start gap-3">
        <Shield className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
        <p className="text-slate-400 text-sm">
          Your assets are protected by MPC multi-signature wallets, $500M insurance coverage, and 95% cold storage. All balances are audited in real-time by Chainalysis and Armanino LLP.
        </p>
      </Card>
    </div>
  );
}
