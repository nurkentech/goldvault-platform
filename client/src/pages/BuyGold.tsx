import { useState } from "react";
import PageLayout from "@/components/PageLayout";
import { Link } from "wouter";
import { ArrowRight, Zap, Shield, Globe, TrendingUp, CheckCircle, Bitcoin, Coins } from "lucide-react";
import { motion } from "framer-motion";

const CRYPTOS = ["BTC", "ETH", "USDT", "SOL", "BNB", "XRP", "USDC", "MATIC", "ADA", "DOT"];
const GOLD_TIERS = [
  { weight: "1g", gvt: 75, usd: 75, popular: false },
  { weight: "5g", gvt: 370, usd: 370, popular: false },
  { weight: "10g", gvt: 735, usd: 735, popular: true },
  { weight: "1oz (31.1g)", gvt: 2340, usd: 2340, popular: false },
  { weight: "100g", gvt: 7350, usd: 7350, popular: false },
  { weight: "10oz", gvt: 23400, usd: 23400, popular: false },
];

const STEPS = [
  { icon: "1", title: "Create Your Account", desc: "Sign up with email or phone in under 2 minutes. Complete KYC verification to unlock full buying power." },
  { icon: "2", title: "Deposit Crypto", desc: "Send BTC, ETH, USDT or any of 300+ supported cryptocurrencies to your GoldVaults wallet." },
  { icon: "3", title: "Choose Your Gold", desc: "Select your gold denomination — from 1g micro bars to 10oz premium bars. Live pricing, no hidden fees." },
  { icon: "4", title: "Confirm & Own Gold", desc: "Your GVT tokens are minted instantly, backed 1:1 by physical gold in our insured vaults. Request delivery anytime." },
];

export default function BuyGold() {
  const [selectedCrypto, setSelectedCrypto] = useState("BTC");
  const [amount, setAmount] = useState("0.05");

  return (
    <PageLayout
      title="Buy Physical Gold With Crypto"
      subtitle="Convert Bitcoin, Ethereum, USDT and 300+ cryptocurrencies into real, vault-stored 99.99% pure gold. Instant settlement, zero counterparty risk."
      badge="⚡ Instant Gold Swap"
      breadcrumb="Buy Gold"
    >
      {/* Converter Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-800 border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-5">Crypto → Gold Converter</h2>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">You Pay</label>
              <div className="flex gap-2">
                <select value={selectedCrypto} onChange={e => setSelectedCrypto(e.target.value)}
                  className="bg-slate-700 border border-white/10 rounded-xl px-3 py-3 text-white text-sm font-bold outline-none focus:border-amber-400/50">
                  {CRYPTOS.map(c => <option key={c}>{c}</option>)}
                </select>
                <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
                  className="flex-1 bg-slate-700 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-amber-400/50" />
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400">⇅</div>
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">You Receive (GVT / Gold)</label>
              <div className="bg-slate-700 border border-amber-400/30 rounded-xl px-4 py-3 text-amber-400 font-bold text-sm">
                ≈ {(parseFloat(amount || "0") * 1400).toFixed(2)} GVT (backed by physical gold)
              </div>
            </div>
            <div className="text-xs text-slate-500 space-y-1">
              <div className="flex justify-between"><span>Exchange Rate</span><span className="text-slate-300">1 {selectedCrypto} ≈ $28,000 USD</span></div>
              <div className="flex justify-between"><span>Gold Price</span><span className="text-slate-300">$2,340 / oz (XAU)</span></div>
              <div className="flex justify-between"><span>Platform Fee</span><span className="text-emerald-400">0.1%</span></div>
              <div className="flex justify-between"><span>Settlement</span><span className="text-emerald-400">{"< 2 minutes"}</span></div>
            </div>
            <Link href="/dashboard">
              <button className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-900 font-black rounded-xl transition-all active:scale-[0.97] flex items-center justify-center gap-2">
                Buy Gold Now <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-4">
          <h2 className="text-xl font-bold text-white mb-2">Why Buy Gold on GoldVaults?</h2>
          {[
            { icon: Zap, title: "Instant Settlement", desc: "Swap crypto for gold-backed GVT tokens in under 2 minutes. No waiting days for bank transfers." },
            { icon: Shield, title: "Fully Audited Vaults", desc: "Every gram of gold is stored in insured vaults, audited quarterly by independent firms. 100% reserve ratio." },
            { icon: Globe, title: "300+ Cryptocurrencies", desc: "Pay with BTC, ETH, USDT, SOL, BNB, XRP, and 295+ more. No need to sell to fiat first." },
            { icon: TrendingUp, title: "Gold Appreciates", desc: "Gold has preserved wealth for 5,000 years. Use crypto's speed to acquire gold's stability." },
          ].map((f, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + i * 0.07 }}
              className="flex gap-4 bg-slate-800/60 border border-white/8 rounded-xl p-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-400/20 flex items-center justify-center shrink-0">
                <f.icon className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <div className="font-bold text-white text-sm mb-0.5">{f.title}</div>
                <div className="text-xs text-slate-400 leading-relaxed">{f.desc}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Gold Tiers */}
      <div className="mb-16">
        <h2 className="text-2xl font-black text-white mb-2">Choose Your Gold Denomination</h2>
        <p className="text-slate-400 mb-6 text-sm">All gold is 99.99% pure, LBMA-certified, and stored in insured vaults. Physical delivery available on request.</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {GOLD_TIERS.map((tier, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              className={`relative bg-slate-800 border rounded-xl p-4 text-center cursor-pointer hover:border-amber-400/50 transition-all ${tier.popular ? "border-amber-400/60 ring-1 ring-amber-400/30" : "border-white/10"}`}>
              {tier.popular && <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-amber-500 text-slate-900 text-xs font-black rounded-full">Popular</div>}
              <div className="text-2xl mb-1">🥇</div>
              <div className="font-black text-white text-sm">{tier.weight}</div>
              <div className="text-amber-400 font-bold text-xs mt-1">${tier.usd.toLocaleString()}</div>
              <div className="text-slate-500 text-xs">{tier.gvt} GVT</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* How It Works */}
      <div className="mb-16">
        <h2 className="text-2xl font-black text-white mb-8 text-center">How It Works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((step, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="text-center">
              <div className="w-12 h-12 rounded-full bg-amber-500 text-slate-900 font-black text-lg flex items-center justify-center mx-auto mb-4">{step.icon}</div>
              <h3 className="font-bold text-white mb-2">{step.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-amber-600/20 via-amber-500/10 to-amber-600/20 border border-amber-400/20 rounded-2xl p-10 text-center">
        <h2 className="text-3xl font-black text-white mb-3">Start Buying Gold Today</h2>
        <p className="text-slate-400 mb-6 max-w-lg mx-auto">Join 5M+ investors who use crypto to buy real, physical gold on GoldVaults. Sign up in 2 minutes.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/dashboard">
            <button className="px-8 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-900 font-black rounded-xl transition-all active:scale-[0.97] flex items-center gap-2">
              <Bitcoin className="w-4 h-4" /> Buy Gold with BTC
            </button>
          </Link>
          <Link href="/how-it-works">
            <button className="px-8 py-3.5 bg-slate-800 hover:bg-slate-700 border border-white/10 text-white font-bold rounded-xl transition-all flex items-center gap-2">
              <Coins className="w-4 h-4" /> Learn How It Works
            </button>
          </Link>
        </div>
      </div>
    </PageLayout>
  );
}
