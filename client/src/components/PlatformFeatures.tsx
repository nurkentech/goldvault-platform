import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Coins, Zap, BarChart3, Lock, TrendingUp, Globe } from "lucide-react";

const features = [
  {
    icon: Coins,
    title: "Multi-Crypto Payment",
    description: "Pay with Bitcoin, Ethereum, Solana, or any major cryptocurrency. Instant conversion to gold-backed tokens (PAXG, XAUT)."
  },
  {
    icon: TrendingUp,
    title: "Earn Yield on Gold",
    description: "Your gold works for you. Earn 2-5% APY through DeFi staking, lending pools, and automated yield strategies."
  },
  {
    icon: Zap,
    title: "AI Robo-Advisory",
    description: "Automated portfolio rebalancing based on your risk profile. Adjust your gold/crypto mix with one click."
  },
  {
    icon: Lock,
    title: "Non-Custodial Security",
    description: "Multi-Party Computation (MPC) ensures your assets are never held by us. You maintain full control."
  },
  {
    icon: BarChart3,
    title: "Real-Time Analytics",
    description: "Track gold prices, portfolio performance, and yield earnings in real-time. Export reports instantly."
  },
  {
    icon: Globe,
    title: "Global Compliance",
    description: "Fully regulated in the US, EU, and UK. KYC/AML verified. Bank-grade security and transparency."
  }
];

export default function PlatformFeatures() {
  return (
    <div className="space-y-12">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-bold text-white">Platform Features</h2>
        <p className="text-xl text-slate-300 max-w-2xl mx-auto">Everything you need to invest in gold like never before.</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, idx) => {
          const Icon = feature.icon;
          return (
            <Card key={idx} className="p-6 bg-slate-800/50 border-slate-700/50 hover:border-amber-500/30 transition group">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-amber-400/20 to-amber-600/20 flex items-center justify-center mb-4 group-hover:from-amber-400/30 group-hover:to-amber-600/30 transition">
                <Icon className="w-6 h-6 text-amber-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
            </Card>
          );
        })}
      </div>

      {/* Benefits Section */}
      <div className="mt-16 space-y-8">
        <h3 className="text-2xl font-bold text-white">Why Choose GoldVault?</h3>
        <div className="grid md:grid-cols-2 gap-8">
          {[
            { title: "Instant Liquidity", desc: "Trade gold 24/7 on global exchanges. No waiting for bank transfers." },
            { title: "Lower Fees", desc: "0.5-1.5% trading spreads vs. 2-3% at traditional dealers." },
            { title: "Fractional Ownership", desc: "Start with as little as $1. Own gold in tiny fractions." },
            { title: "DeFi Integration", desc: "Use your gold as collateral for loans or stake for yield." },
            { title: "Tax Reporting", desc: "Automated tax documents for all jurisdictions." },
            { title: "Social Trading", desc: "Copy the strategies of top gold investors." }
          ].map((benefit, idx) => (
            <div key={idx} className="flex gap-4">
              <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                <div className="w-2 h-2 rounded-full bg-green-400"></div>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-1">{benefit.title}</h4>
                <p className="text-slate-400 text-sm">{benefit.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing Section */}
      <div className="mt-16 space-y-8">
        <h3 className="text-2xl font-bold text-white">Pricing Plans</h3>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { name: "Starter", price: "Free", features: ["Buy & hold gold", "Basic analytics", "1% trading spread", "Email support"] },
            { name: "Pro", price: "$9.99/mo", features: ["Everything in Starter", "DeFi yield staking", "0.5% trading spread", "Robo-advisory", "Priority support"], featured: true },
            { name: "Institutional", price: "Custom", features: ["Everything in Pro", "API access", "Dedicated account manager", "Custom integrations"] }
          ].map((plan, idx) => (
            <Card key={idx} className={`p-8 ${plan.featured ? 'border-amber-500/50 bg-amber-500/10' : 'bg-slate-800/50 border-slate-700/50'} transition`}>
              <h4 className="text-lg font-semibold text-white mb-2">{plan.name}</h4>
              <div className="text-3xl font-bold text-amber-400 mb-6">{plan.price}</div>
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, fidx) => (
                  <li key={fidx} className="text-slate-300 text-sm flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => toast.info(plan.featured ? 'Start your free trial' : 'Get started with GoldVaults', { description: 'Create a free account to access all platform features.' })}
                className={`w-full py-2 rounded-lg font-semibold transition ${plan.featured ? 'bg-amber-500 hover:bg-amber-600 text-white' : 'border border-slate-600 text-white hover:bg-slate-700'}`}
              >
                {plan.featured ? 'Start Free Trial' : 'Get Started'}
              </button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
