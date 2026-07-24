import { Card } from "@/components/ui/card";
import { Database, Shield, Zap, Cloud, Lock, Network } from "lucide-react";

export default function TechnicalArchitecture() {
  return (
    <div className="space-y-12">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-bold text-white">Platform Architecture</h2>
        <p className="text-xl text-slate-300 max-w-2xl mx-auto">Modern microservices architecture ensuring high availability, security, and rapid feature deployment.</p>
      </div>

      {/* Architecture Layers */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="p-8 bg-slate-800/50 border-slate-700/50 hover:border-blue-500/30 transition">
          <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center mb-4">
            <Cloud className="w-6 h-6 text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-4">Frontend Layer</h3>
          <ul className="space-y-2 text-slate-300 text-sm">
            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>Mobile App (iOS/Android)</li>
            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>Web Dashboard (React)</li>
            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>API Gateway / Auth</li>
          </ul>
        </Card>

        <Card className="p-8 bg-slate-800/50 border-slate-700/50 hover:border-amber-500/30 transition md:scale-105">
          <div className="w-12 h-12 rounded-lg bg-amber-500/20 flex items-center justify-center mb-4">
            <Zap className="w-6 h-6 text-amber-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-4">Core Services Layer</h3>
          <ul className="space-y-2 text-slate-300 text-sm">
            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>Order Matching Engine</li>
            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>Wallet & Custody (MPC)</li>
            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>Liquidity Aggregator</li>
            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>KYC/AML Real-time Engine</li>
          </ul>
        </Card>

        <Card className="p-8 bg-slate-800/50 border-slate-700/50 hover:border-purple-500/30 transition">
          <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center mb-4">
            <Database className="w-6 h-6 text-purple-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-4">Data & Infrastructure</h3>
          <ul className="space-y-2 text-slate-300 text-sm">
            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>Immutable Ledger</li>
            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>Data Lake / Analytics</li>
            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>Cloud Native (K8s)</li>
          </ul>
        </Card>
      </div>

      {/* Key Features */}
      <div className="mt-16 space-y-8">
        <h3 className="text-2xl font-bold text-white">Key Functional Modules</h3>
        <div className="grid md:grid-cols-2 gap-6">
          {[
            { icon: Zap, title: "Robo-Advisory", desc: "AI-driven automated portfolio rebalancing based on risk profiles" },
            { icon: Network, title: "Social Trading", desc: "Follow and copy the trades of top-performing gold investors" },
            { icon: Shield, title: "Yield & Staking", desc: "Earn 2-5% APY on gold-backed tokens via DeFi integration" },
            { icon: Lock, title: "Non-Custodial", desc: "MPC ensures your assets are never held by us" }
          ].map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <Card key={idx} className="p-6 bg-slate-800/50 border-slate-700/50 hover:border-amber-500/30 transition">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">{feature.title}</h4>
                    <p className="text-slate-400 text-sm">{feature.desc}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Compliance */}
      <div className="mt-16 space-y-8">
        <h3 className="text-2xl font-bold text-white">Regulatory Compliance Framework</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6 bg-slate-800/50 border-slate-700/50">
            <h4 className="text-lg font-semibold text-white mb-4">United States</h4>
            <ul className="space-y-2 text-slate-300 text-sm">
              <li><strong>SEC/FINRA:</strong> Securities & broker-dealer registration</li>
              <li><strong>FinCEN:</strong> Money Services Business (MSB) registration</li>
              <li><strong>State MTLs:</strong> Money Transmitter Licenses (50+ states)</li>
              <li><strong>CFPB:</strong> Consumer protection oversight</li>
            </ul>
          </Card>

          <Card className="p-6 bg-slate-800/50 border-slate-700/50">
            <h4 className="text-lg font-semibold text-white mb-4">Europe & UK</h4>
            <ul className="space-y-2 text-slate-300 text-sm">
              <li><strong>MiCA (EU):</strong> Crypto-assets & stablecoins framework</li>
              <li><strong>DORA (EU):</strong> Digital Operational Resilience Act</li>
              <li><strong>PSD2/PSD3:</strong> Open banking & payment services</li>
              <li><strong>FCA (UK):</strong> Conduct & prudential supervision</li>
            </ul>
          </Card>
        </div>
      </div>

      {/* Risk Management */}
      <div className="mt-16 space-y-8">
        <h3 className="text-2xl font-bold text-white">Risk Priority Matrix</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { label: "Cybersecurity", score: 95, color: "from-red-500 to-red-600" },
            { label: "Regulatory", score: 90, color: "from-orange-500 to-orange-600" },
            { label: "Operational", score: 85, color: "from-yellow-500 to-yellow-600" },
            { label: "Liquidity", score: 75, color: "from-green-500 to-green-600" },
            { label: "Market", score: 70, color: "from-blue-500 to-blue-600" }
          ].map((risk, idx) => (
            <Card key={idx} className="p-4 bg-slate-800/50 border-slate-700/50">
              <div className="text-center">
                <div className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-br ${risk.color} flex items-center justify-center mb-3`}>
                  <span className="text-xl font-bold text-white">{risk.score}</span>
                </div>
                <p className="text-sm font-semibold text-white">{risk.label}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
