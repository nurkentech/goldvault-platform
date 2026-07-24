import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bitcoin, CreditCard, Zap, DollarSign, Wallet } from "lucide-react";

export default function PaymentIntegration() {
  const cryptoPayments = [
    { name: "Bitcoin", symbol: "BTC", icon: "₿", networks: ["Bitcoin", "Lightning"] },
    { name: "Ethereum", symbol: "ETH", icon: "Ξ", networks: ["Ethereum", "Polygon", "Arbitrum"] },
    { name: "Solana", symbol: "SOL", icon: "◎", networks: ["Solana"] },
    { name: "USDC", symbol: "USDC", icon: "U", networks: ["Multiple Chains"] },
    { name: "USDT", symbol: "USDT", icon: "T", networks: ["Multiple Chains"] },
    { name: "XRP", symbol: "XRP", icon: "✕", networks: ["XRP Ledger"] }
  ];

  const defiIntegrations = [
    { name: "Uniswap", desc: "Decentralized token swaps", fee: "0.3-1%" },
    { name: "Aave", desc: "Lending & borrowing protocol", fee: "Variable" },
    { name: "Curve", desc: "Stablecoin liquidity", fee: "0.04%" },
    { name: "Yearn", desc: "Yield farming strategies", fee: "2% + 20%" },
    { name: "Lido", desc: "Liquid staking", fee: "10%" },
    { name: "MakerDAO", desc: "Stablecoin generation", fee: "2-6%" }
  ];

  const traditionalPayments = [
    { name: "Credit Card", icon: CreditCard, fee: "2.9% + $0.30", speed: "Instant" },
    { name: "Bank Transfer", icon: DollarSign, fee: "0.5%", speed: "1-3 days" },
    { name: "PayPal", icon: Wallet, fee: "2.2%", speed: "Instant" },
    { name: "Apple Pay", icon: Wallet, fee: "2.9%", speed: "Instant" }
  ];

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-bold text-white">All-In-One Payment Integration</h2>
        <p className="text-xl text-slate-300 max-w-2xl mx-auto">
          Buy gold with any payment method: crypto, DeFi, traditional banking, and more.
        </p>
      </div>

      <Tabs defaultValue="crypto" className="w-full">
        <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-3 bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="crypto" className="data-[state=active]:bg-amber-500">
            <Bitcoin className="w-4 h-4 mr-2" />
            Cryptocurrency
          </TabsTrigger>
          <TabsTrigger value="defi" className="data-[state=active]:bg-amber-500">
            <Zap className="w-4 h-4 mr-2" />
            DeFi
          </TabsTrigger>
          <TabsTrigger value="traditional" className="data-[state=active]:bg-amber-500">
            <CreditCard className="w-4 h-4 mr-2" />
            Traditional
          </TabsTrigger>
        </TabsList>

        {/* Crypto Tab */}
        <TabsContent value="crypto" className="space-y-6 mt-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cryptoPayments.map((crypto, idx) => (
              <Card key={idx} className="p-6 bg-slate-800/50 border-slate-700/50 hover:border-amber-500/30 transition">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-amber-500/20 flex items-center justify-center text-2xl">
                    {crypto.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{crypto.name}</h3>
                    <p className="text-xs text-slate-400">{crypto.symbol}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-slate-300 uppercase">Supported Networks:</p>
                  <div className="flex flex-wrap gap-2">
                    {crypto.networks.map((network, nidx) => (
                      <span key={nidx} className="text-xs bg-slate-700/50 text-slate-200 px-2 py-1 rounded">
                        {network}
                      </span>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-6">
            <h3 className="font-semibold text-white mb-4">Crypto Payment Flow</h3>
            <div className="space-y-3">
              {[
                "1. Select cryptocurrency and amount",
                "2. Choose network (Ethereum, Polygon, Solana, etc.)",
                "3. Send payment to GoldVault wallet",
                "4. Instant conversion to gold-backed tokens (PAXG/XAUT)",
                "5. Gold credited to your account immediately"
              ].map((step, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center text-xs font-bold text-amber-400">
                    ✓
                  </div>
                  <p className="text-slate-300 text-sm">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* DeFi Tab */}
        <TabsContent value="defi" className="space-y-6 mt-8">
          <div className="grid md:grid-cols-2 gap-6">
            {defiIntegrations.map((defi, idx) => (
              <Card key={idx} className="p-6 bg-slate-800/50 border-slate-700/50 hover:border-amber-500/30 transition">
                <h3 className="font-semibold text-white mb-2">{defi.name}</h3>
                <p className="text-sm text-slate-400 mb-4">{defi.desc}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Protocol Fee:</span>
                  <span className="text-sm font-semibold text-amber-400">{defi.fee}</span>
                </div>
              </Card>
            ))}
          </div>

          <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-6">
            <h3 className="font-semibold text-white mb-4">DeFi Yield Strategies</h3>
            <div className="space-y-4">
              {[
                { strategy: "Staking", yield: "2-5% APY", desc: "Earn yield by staking gold tokens in DeFi protocols" },
                { strategy: "Liquidity Pools", yield: "5-15% APY", desc: "Provide liquidity and earn trading fees" },
                { strategy: "Lending", yield: "3-8% APY", desc: "Lend gold tokens to borrowers via Aave/Compound" },
                { strategy: "Yield Farming", yield: "10-50% APY", desc: "Participate in incentivized farming campaigns" }
              ].map((item, idx) => (
                <div key={idx} className="flex items-start justify-between pb-4 border-b border-slate-700/50 last:border-b-0">
                  <div>
                    <p className="font-semibold text-white">{item.strategy}</p>
                    <p className="text-xs text-slate-400 mt-1">{item.desc}</p>
                  </div>
                  <span className="text-sm font-bold text-green-400 whitespace-nowrap ml-4">{item.yield}</span>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Traditional Tab */}
        <TabsContent value="traditional" className="space-y-6 mt-8">
          <div className="grid md:grid-cols-2 gap-6">
            {traditionalPayments.map((payment, idx) => {
              const Icon = payment.icon;
              return (
                <Card key={idx} className="p-6 bg-slate-800/50 border-slate-700/50 hover:border-amber-500/30 transition">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-blue-400" />
                    </div>
                    <h3 className="font-semibold text-white">{payment.name}</h3>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-xs text-slate-400">Fee:</span>
                      <span className="text-sm font-semibold text-slate-200">{payment.fee}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-slate-400">Processing:</span>
                      <span className="text-sm font-semibold text-green-400">{payment.speed}</span>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-6">
            <h3 className="font-semibold text-white mb-4">Traditional Payment Advantages</h3>
            <ul className="space-y-2">
              {[
                "✓ Familiar payment methods (credit card, bank transfer)",
                "✓ No crypto wallet required",
                "✓ Instant processing for most methods",
                "✓ Full buyer protection and fraud prevention",
                "✓ Automated KYC/AML compliance"
              ].map((item, idx) => (
                <li key={idx} className="text-slate-300 text-sm">{item}</li>
              ))}
            </ul>
          </div>
        </TabsContent>
      </Tabs>

      {/* Comparison Table */}
      <Card className="p-6 bg-slate-800/50 border-slate-700/50 overflow-x-auto">
        <h3 className="text-lg font-semibold text-white mb-4">Payment Method Comparison</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left py-3 px-4 text-slate-300 font-semibold">Method</th>
              <th className="text-center py-3 px-4 text-slate-300 font-semibold">Fee</th>
              <th className="text-center py-3 px-4 text-slate-300 font-semibold">Speed</th>
              <th className="text-center py-3 px-4 text-slate-300 font-semibold">Min Amount</th>
              <th className="text-center py-3 px-4 text-slate-300 font-semibold">Max Amount</th>
            </tr>
          </thead>
          <tbody>
            {[
              { method: "Bitcoin", fee: "Network", speed: "10 min", min: "$1", max: "Unlimited" },
              { method: "Ethereum", fee: "Network", speed: "2 min", min: "$1", max: "Unlimited" },
              { method: "Credit Card", fee: "2.9%", speed: "Instant", min: "$10", max: "$50,000" },
              { method: "Bank Transfer", fee: "0.5%", speed: "1-3 days", min: "$100", max: "Unlimited" },
              { method: "Aave Lending", fee: "Variable", speed: "1 min", min: "$1", max: "Unlimited" }
            ].map((row, idx) => (
              <tr key={idx} className="border-b border-slate-700/50 hover:bg-slate-700/20 transition">
                <td className="py-3 px-4 text-white font-medium">{row.method}</td>
                <td className="py-3 px-4 text-center text-slate-300">{row.fee}</td>
                <td className="py-3 px-4 text-center text-slate-300">{row.speed}</td>
                <td className="py-3 px-4 text-center text-slate-300">{row.min}</td>
                <td className="py-3 px-4 text-center text-slate-300">{row.max}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
