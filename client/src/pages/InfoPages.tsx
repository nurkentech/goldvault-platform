import PageLayout from "@/components/PageLayout";
import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  Shield, Lock, CheckCircle, Zap, Globe, Award, TrendingUp, TrendingDown,
  Coins, Bitcoin, CreditCard, Users, Star, Mail, Phone, MapPin, ChevronDown,
  Package, Truck, Bell, ArrowLeftRight, Gift, Gamepad2, MessageSquare,
  BarChart2, BookOpen, FileText, Briefcase, Building2
} from "lucide-react";
import { useState } from "react";

// ─── How It Works ─────────────────────────────────────────────────────────────
export function HowItWorksPage() {
  const steps = [
    { n: "01", icon: Users, title: "Create Your Account", desc: "Sign up with email or phone number. Complete KYC identity verification in under 5 minutes using your passport or driver's license." },
    { n: "02", icon: Bitcoin, title: "Deposit Cryptocurrency", desc: "Send BTC, ETH, USDT, SOL or any of 300+ supported cryptocurrencies to your GoldVaults wallet. Funds arrive in minutes." },
    { n: "03", icon: Coins, title: "Choose Your Gold", desc: "Select your denomination: 1g micro bars for beginners, up to 10oz premium bars for serious investors. Live pricing, no hidden fees." },
    { n: "04", icon: Shield, title: "Instant Gold Swap", desc: "Your crypto is converted to GVT tokens in under 2 minutes. Each GVT is backed 1:1 by physical gold in our insured vaults." },
    { n: "05", icon: Package, title: "Hold, Trade or Deliver", desc: "Hold GVT in your wallet, trade it on the exchange, or request physical delivery of your gold bar to any address worldwide." },
    { n: "06", icon: Gift, title: "Earn GoldCoins", desc: "Complete daily challenges, refer friends, and engage with the community to earn GoldCoins — redeemable for more gold bars." },
  ];
  return (
    <PageLayout title="How GoldVaults Works" subtitle="From crypto to physical gold in 6 simple steps. The fastest, most secure way to convert digital assets into real-world gold." badge="📖 Step by Step" breadcrumb="How It Works">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-14">
        {steps.map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
            className="bg-slate-800 border border-white/10 rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-4 right-4 text-5xl font-black text-white/5">{s.n}</div>
            <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-400/20 flex items-center justify-center mb-4">
              <s.icon className="w-6 h-6 text-amber-400" />
            </div>
            <h3 className="font-bold text-white mb-2">{s.title}</h3>
            <p className="text-sm text-slate-400 leading-relaxed">{s.desc}</p>
          </motion.div>
        ))}
      </div>
      <div className="bg-gradient-to-r from-amber-600/20 via-amber-500/10 to-amber-600/20 border border-amber-400/20 rounded-2xl p-10 text-center">
        <h2 className="text-2xl font-black text-white mb-3">Ready to Buy Your First Gold Bar?</h2>
        <p className="text-slate-400 mb-6">Join 5M+ investors. Takes less than 5 minutes to get started.</p>
        <Link href="/buy-gold"><button className="px-8 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-900 font-black rounded-xl transition-all">Buy Gold Now →</button></Link>
      </div>
    </PageLayout>
  );
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────
export function FAQPage() {
  const [open, setOpen] = useState<number | null>(0);
  const faqs = [
    { q: "How do I buy physical gold with crypto?", a: "Sign up, deposit any supported crypto, navigate to Buy Gold, select your denomination, and confirm. Your GVT tokens (backed by physical gold) are minted in under 2 minutes." },
    { q: "Is the gold real and audited?", a: "Yes — 100% real, 99.99% pure LBMA-certified gold. All physical gold is stored in insured vaults audited quarterly by independent firms. Every gram is accounted for." },
    { q: "What is the GVT token?", a: "GVT (GoldVault Token) is our native gold-backed token. Each GVT is pegged 1:1 to a fixed weight of 99.99% pure gold held in our vaults. Hold, trade, or redeem for physical delivery." },
    { q: "Can I get physical gold delivered?", a: "Yes. Request physical delivery of 1g, 10g, 1oz, or 10oz gold bars. We ship in tamper-proof, insured packaging to any address worldwide. Or store in our vaults indefinitely at no cost." },
    { q: "What cryptocurrencies are supported?", a: "300+ cryptocurrencies including BTC, ETH, USDT, SOL, BNB, XRP, USDC, ADA, MATIC, DOT, AVAX, LINK, and all major altcoins." },
    { q: "How are my assets secured?", a: "95% of assets in air-gapped cold wallets. 256-bit AES encryption, multi-factor authentication, $500M insurance fund, ISO 27001 and SOC 2 Type II certified." },
    { q: "What are GoldCoins?", a: "GoldCoins are our reward currency. Earn them by completing daily/weekly challenges, referring friends, trading, and engaging with the social hub. Redeem for gold bars or fee discounts." },
    { q: "Is GoldVaults regulated?", a: "Yes. Registered with SEC, FinCEN licensed, FCA authorized (UK), MiCA compliant (EU). We maintain ISO 27001, SOC 2 Type II, PCI DSS, and GDPR compliance." },
    { q: "What are the fees?", a: "Gold swap fee: 0.1%. Spot trading: 0.1% maker/0.1% taker. Physical delivery: flat shipping fee by region. No hidden fees, no monthly charges." },
    { q: "How does the NFC Debit Card work?", a: "The GoldVaults Visa debit card lets you spend your gold-backed balance anywhere Visa is accepted. Tap to pay with NFC, earn 1% cashback in GoldCoins, set spending limits in-app." },
  ];
  return (
    <PageLayout title="Frequently Asked Questions" subtitle="Everything you need to know about buying gold with crypto on GoldVaults." badge="❓ Help Center" breadcrumb="FAQ">
      <div className="max-w-3xl mx-auto space-y-3">
        {faqs.map((item, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }}
            className={`bg-slate-800 border rounded-xl overflow-hidden transition-all ${open === i ? "border-amber-400/30" : "border-white/8"}`}>
            <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-between px-5 py-4 text-left">
              <span className="font-semibold text-white text-sm pr-4">{item.q}</span>
              <motion.div animate={{ rotate: open === i ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronDown className="w-4 h-4 text-amber-400 shrink-0" />
              </motion.div>
            </button>
            {open === i && <div className="px-5 pb-4 text-sm text-slate-400 leading-relaxed border-t border-white/5 pt-3">{item.a}</div>}
          </motion.div>
        ))}
      </div>
    </PageLayout>
  );
}

// ─── Security ─────────────────────────────────────────────────────────────────
export function SecurityPage() {
  const features = [
    { icon: Lock, title: "Cold Storage", desc: "95% of all assets stored in air-gapped cold wallets, completely offline and immune to online attacks." },
    { icon: Shield, title: "256-bit AES Encryption", desc: "Military-grade encryption protects all data at rest and in transit. Your keys, your gold." },
    { icon: CheckCircle, title: "Multi-Factor Authentication", desc: "Mandatory 2FA for all accounts. Support for authenticator apps, SMS, and hardware security keys." },
    { icon: Award, title: "$500M Insurance Fund", desc: "Dedicated insurance fund covers 100% of user assets in the unlikely event of a security breach." },
    { icon: Globe, title: "ISO 27001 Certified", desc: "Annual third-party security audits. ISO 27001, SOC 2 Type II, PCI DSS, and GDPR compliant." },
    { icon: Building2, title: "Vault Audits", desc: "All physical gold vaults are audited quarterly by independent firms. Full audit reports published publicly." },
  ];
  return (
    <PageLayout title="Security & Trust" subtitle="Your gold and crypto are protected by institutional-grade security. We take the safety of your assets more seriously than anything else." badge="🔒 Bank-Grade Security" breadcrumb="Security">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-14">
        {features.map((f, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}
            className="bg-slate-800 border border-white/10 rounded-2xl p-6">
            <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-400/20 flex items-center justify-center mb-4">
              <f.icon className="w-6 h-6 text-amber-400" />
            </div>
            <h3 className="font-bold text-white mb-2">{f.title}</h3>
            <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
          </motion.div>
        ))}
      </div>
      <div className="bg-slate-800 border border-white/10 rounded-2xl p-8 mb-8">
        <h2 className="text-xl font-black text-white mb-4">Regulatory Compliance</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {["SEC Registered", "FinCEN Licensed", "FCA Authorized", "MiCA Compliant", "ISO 27001", "SOC 2 Type II", "PCI DSS", "GDPR Compliant"].map(b => (
            <div key={b} className="flex items-center gap-2 bg-slate-700/50 rounded-xl px-3 py-2.5">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-xs font-semibold text-white">{b}</span>
            </div>
          ))}
        </div>
      </div>
    </PageLayout>
  );
}

// ─── GVT Token ────────────────────────────────────────────────────────────────
export function GVTTokenPage() {
  return (
    <PageLayout title="GVT — GoldVault Token" subtitle="The world's first fully-audited, physically-backed gold token. Each GVT equals a fixed weight of 99.99% pure gold stored in insured vaults." badge="🥇 Gold-Backed Token" breadcrumb="GVT Token">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-14">
        <div>
          <h2 className="text-2xl font-black text-white mb-4">What is GVT?</h2>
          <p className="text-slate-400 leading-relaxed mb-4">GVT (GoldVault Token) is a gold-backed digital token issued on the Ethereum blockchain. Each GVT is pegged 1:1 to a fixed weight of 99.99% pure, LBMA-certified gold held in our insured vault network.</p>
          <p className="text-slate-400 leading-relaxed mb-4">Unlike other gold tokens, GVT is fully redeemable for physical gold delivery at any time. No lock-up periods, no redemption fees, no minimum holding requirements.</p>
          <div className="space-y-3 mt-6">
            {[
              "1:1 backed by physical gold in insured vaults",
              "Quarterly independent vault audits published publicly",
              "Redeemable for physical delivery in 1g, 10g, 1oz, 10oz",
              "ERC-20 compatible — use in any DeFi protocol",
              "Instant mint/redeem via GoldVaults platform",
              "Zero storage fees for vault-held gold",
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-2.5 text-sm text-slate-300">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                {f}
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <div className="bg-slate-800 border border-amber-400/30 rounded-2xl p-6">
            <div className="text-xs text-slate-400 mb-1">GVT / USD Live Price</div>
            <div className="text-3xl font-black text-amber-400">$2,340.50</div>
            <div className="text-sm text-emerald-400 font-semibold">+0.82% (24h)</div>
            <div className="text-xs text-slate-500 mt-2">Pegged to XAU/USD spot price</div>
          </div>
          {[
            { label: "Total Supply", value: "182,500 GVT" },
            { label: "Gold Backing", value: "182,500g (5,869 oz)" },
            { label: "Market Cap", value: "$427M" },
            { label: "24h Volume", value: "$42M" },
            { label: "Blockchain", value: "Ethereum (ERC-20)" },
            { label: "Contract", value: "0x1234...abcd" },
          ].map((s, i) => (
            <div key={i} className="flex justify-between items-center bg-slate-800 border border-white/8 rounded-xl px-4 py-3">
              <span className="text-sm text-slate-400">{s.label}</span>
              <span className="text-sm font-bold text-white">{s.value}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-gradient-to-r from-amber-600/20 via-amber-500/10 to-amber-600/20 border border-amber-400/20 rounded-2xl p-10 text-center">
        <h2 className="text-2xl font-black text-white mb-3">Get GVT Tokens Today</h2>
        <p className="text-slate-400 mb-6">Swap any crypto for GVT and own real gold on the blockchain.</p>
        <Link href="/buy-gold"><button className="px-8 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-900 font-black rounded-xl transition-all">Buy GVT →</button></Link>
      </div>
    </PageLayout>
  );
}

// ─── Vault Storage ─────────────────────────────────────────────────────────────
export function VaultStoragePage() {
  return (
    <PageLayout title="Vault Storage" subtitle="Your gold is stored in world-class, insured, audited vaults operated by our 8 global mining and custody partners. Zero storage fees." badge="🏦 Secure Vaults" breadcrumb="Vault Storage">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-14">
        {[
          { name: "London, UK", partner: "Barrick Gold", capacity: "50,000 oz", certified: "LBMA Approved" },
          { name: "Zurich, Switzerland", partner: "Newmont", capacity: "40,000 oz", certified: "LBMA Approved" },
          { name: "Singapore", partner: "AngloGold Ashanti", capacity: "35,000 oz", certified: "MAS Regulated" },
          { name: "New York, USA", partner: "Kinross Gold", capacity: "45,000 oz", certified: "COMEX Approved" },
          { name: "Dubai, UAE", partner: "Agnico Eagle", capacity: "30,000 oz", certified: "DMCC Certified" },
          { name: "Toronto, Canada", partner: "Gold Fields", capacity: "25,000 oz", certified: "LBMA Approved" },
        ].map((v, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}
            className="bg-slate-800 border border-white/10 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Building2 className="w-5 h-5 text-amber-400" />
              <span className="font-bold text-white">{v.name}</span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-slate-400">Partner</span><span className="text-white font-semibold">{v.partner}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Capacity</span><span className="text-white font-semibold">{v.capacity}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Certification</span><span className="text-emerald-400 font-semibold">{v.certified}</span></div>
            </div>
          </motion.div>
        ))}
      </div>
      <div className="bg-slate-800 border border-white/10 rounded-2xl p-8 mb-8">
        <h2 className="text-xl font-black text-white mb-4">Storage Benefits</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            "Zero storage fees — hold your gold indefinitely at no cost",
            "Fully insured against theft, fire, and natural disasters",
            "Quarterly independent audits with public reports",
            "Instant redemption — request physical delivery anytime",
            "24/7 vault monitoring with biometric access control",
            "Segregated storage — your gold is always identifiable",
          ].map((b, i) => (
            <div key={i} className="flex items-start gap-2.5 text-sm text-slate-300">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              {b}
            </div>
          ))}
        </div>
      </div>
    </PageLayout>
  );
}

// ─── Physical Delivery ────────────────────────────────────────────────────────
export function PhysicalDeliveryPage() {
  return (
    <PageLayout title="Physical Gold Delivery" subtitle="Redeem your GVT tokens for real gold bars delivered to your door. Tamper-proof, fully insured, tracked shipping worldwide." badge="📦 Worldwide Delivery" breadcrumb="Physical Delivery">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-14">
        {[
          { weight: "1g", price: "$75", delivery: "3-5 days", shipping: "$15" },
          { weight: "10g", price: "$735", delivery: "3-5 days", shipping: "$18" },
          { weight: "1oz (31.1g)", price: "$2,340", delivery: "5-7 days", shipping: "$25" },
          { weight: "10oz", price: "$23,400", delivery: "7-10 days", shipping: "Free" },
        ].map((t, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
            className="bg-slate-800 border border-white/10 rounded-2xl p-5 text-center">
            <div className="text-3xl mb-2">🥇</div>
            <div className="font-black text-white text-lg">{t.weight}</div>
            <div className="text-amber-400 font-bold mt-1">{t.price}</div>
            <div className="text-xs text-slate-400 mt-3 space-y-1">
              <div className="flex justify-between"><span>Delivery</span><span className="text-white">{t.delivery}</span></div>
              <div className="flex justify-between"><span>Shipping</span><span className="text-emerald-400">{t.shipping}</span></div>
            </div>
            <Link href="/buy-gold"><button className="w-full mt-4 py-2 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/25 text-amber-400 text-xs font-bold rounded-xl transition-all">Order Now</button></Link>
          </motion.div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {[
          { icon: Package, title: "Tamper-Proof Packaging", desc: "Each gold bar is sealed in a tamper-evident assay card with a unique serial number and certificate of authenticity." },
          { icon: Shield, title: "Fully Insured Shipping", desc: "All deliveries are insured for full replacement value. Signature required on delivery for your protection." },
          { icon: Truck, title: "Tracked Worldwide", desc: "Real-time tracking from vault to your door. We deliver to 150+ countries via DHL, Brinks, and Malca-Amit." },
        ].map((f, i) => (
          <div key={i} className="bg-slate-800 border border-white/10 rounded-2xl p-5">
            <f.icon className="w-6 h-6 text-amber-400 mb-3" />
            <h3 className="font-bold text-white mb-2">{f.title}</h3>
            <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </PageLayout>
  );
}

// ─── Exchange ─────────────────────────────────────────────────────────────────
export function ExchangePage() {
  return (
    <PageLayout title="Crypto Exchange" subtitle="Trade 300+ cryptocurrencies with gold-backed GVT tokens. Spot trading, instant swaps, and gold-to-crypto conversion — all in one place." badge="⚡ Live Trading" breadcrumb="Exchange">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        {[
          { icon: ArrowLeftRight, title: "Spot Trading", desc: "Trade BTC, ETH, SOL, BNB and 300+ pairs with tight spreads and deep liquidity. 0.1% maker/taker fees." },
          { icon: Coins, title: "Gold Swap", desc: "Instantly swap any crypto for GVT gold tokens. Best rates guaranteed. Settlement in under 2 minutes." },
          { icon: TrendingUp, title: "Gold ETF Trading", desc: "Trade tokenized gold ETFs including GLD, IAU, GLDM, SGOL, AAAU alongside crypto in one unified wallet." },
        ].map((f, i) => (
          <div key={i} className="bg-slate-800 border border-white/10 rounded-2xl p-6">
            <f.icon className="w-6 h-6 text-amber-400 mb-3" />
            <h3 className="font-bold text-white mb-2">{f.title}</h3>
            <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
      <div className="bg-slate-800 border border-white/10 rounded-2xl p-6 mb-10">
        <h2 className="text-xl font-black text-white mb-4">Top Trading Pairs</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-white/8 text-xs text-slate-400"><th className="text-left py-2 px-3">Pair</th><th className="text-right py-2 px-3">Price</th><th className="text-right py-2 px-3">24h Change</th><th className="text-right py-2 px-3">Volume</th></tr></thead>
            <tbody>
              {[
                { pair: "GVT/USDT", price: "$2,340.50", change: "+0.82%", up: true, vol: "$42M" },
                { pair: "BTC/USDT", price: "$67,420", change: "+2.34%", up: true, vol: "$28.4B" },
                { pair: "ETH/USDT", price: "$3,520", change: "+1.87%", up: true, vol: "$14.2B" },
                { pair: "BTC/GVT", price: "28.81 GVT", change: "+1.52%", up: true, vol: "$8.2M" },
                { pair: "ETH/GVT", price: "1.504 GVT", change: "+1.05%", up: true, vol: "$3.1M" },
              ].map((r, i) => (
                <tr key={i} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                  <td className="py-3 px-3 font-bold text-white">{r.pair}</td>
                  <td className="py-3 px-3 text-right text-white">{r.price}</td>
                  <td className={`py-3 px-3 text-right font-semibold ${r.up ? "text-emerald-400" : "text-red-400"}`}>{r.change}</td>
                  <td className="py-3 px-3 text-right text-slate-400">{r.vol}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="text-center">
        <Link href="/dashboard"><button className="px-8 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-900 font-black rounded-xl transition-all">Start Trading →</button></Link>
      </div>
    </PageLayout>
  );
}

// ─── NFC Debit Card ────────────────────────────────────────────────────────────
export function NFCCardPage() {
  return (
    <PageLayout title="GoldVaults NFC Debit Card" subtitle="Spend your gold-backed balance anywhere Visa is accepted. Tap to pay, earn GoldCoins cashback, and manage everything in-app." badge="💳 Visa Debit Card" breadcrumb="NFC Debit Card">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-14">
        <div>
          <div className="w-full max-w-sm mx-auto bg-gradient-to-br from-amber-600 to-amber-800 rounded-2xl p-6 shadow-2xl shadow-amber-500/20 mb-6">
            <div className="flex justify-between items-start mb-8">
              <div className="text-white font-black text-lg">GoldVaults</div>
              <div className="text-white/70 text-xs">VISA</div>
            </div>
            <div className="text-white font-mono text-lg tracking-widest mb-4">•••• •••• •••• 4291</div>
            <div className="flex justify-between items-end">
              <div><div className="text-white/60 text-xs">CARD HOLDER</div><div className="text-white font-bold text-sm">YOUR NAME</div></div>
              <div className="text-white/60 text-xs">NFC ))))</div>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          {[
            { icon: CreditCard, title: "Tap to Pay Anywhere", desc: "NFC-enabled Visa debit card accepted at 80M+ merchants worldwide. Apple Pay and Google Pay compatible." },
            { icon: Gift, title: "1% GoldCoins Cashback", desc: "Earn 1% back in GoldCoins on every purchase. Redeem for more gold bars or fee discounts." },
            { icon: Shield, title: "Instant Freeze/Unfreeze", desc: "Lost your card? Freeze it instantly in the app. Unfreeze just as fast when you find it." },
            { icon: Bell, title: "Real-Time Notifications", desc: "Get instant push notifications for every transaction. Set spending limits by category." },
          ].map((f, i) => (
            <div key={i} className="flex gap-4 bg-slate-800 border border-white/10 rounded-xl p-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-400/20 flex items-center justify-center shrink-0">
                <f.icon className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <div className="font-bold text-white text-sm mb-0.5">{f.title}</div>
                <div className="text-xs text-slate-400 leading-relaxed">{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="text-center">
        <Link href="/dashboard"><button className="px-8 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-900 font-black rounded-xl transition-all">Apply for Your Card →</button></Link>
      </div>
    </PageLayout>
  );
}

// ─── GoldCoins Rewards ────────────────────────────────────────────────────────
export function GoldCoinsPage() {
  return (
    <PageLayout title="GoldCoins Rewards" subtitle="Earn GoldCoins by trading, completing challenges, referring friends, and engaging with the community. Redeem for real gold bars." badge="🪙 Earn & Redeem" breadcrumb="GoldCoins">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-14">
        {[
          { icon: ArrowLeftRight, title: "Trade to Earn", desc: "Earn 10 GoldCoins per $100 traded on the platform. The more you trade, the more you earn.", coins: "10 GC / $100" },
          { icon: Gamepad2, title: "Daily Challenges", desc: "Complete daily and weekly challenges to earn bonus GoldCoins. New challenges every 24 hours.", coins: "50–500 GC/day" },
          { icon: Users, title: "Refer Friends", desc: "Earn 1,000 GoldCoins for every friend you refer who completes KYC and makes their first gold purchase.", coins: "1,000 GC/referral" },
          { icon: MessageSquare, title: "Social Engagement", desc: "Post gold investment content, share your portfolio, and engage with the community to earn GoldCoins.", coins: "5–50 GC/post" },
          { icon: CreditCard, title: "Card Cashback", desc: "Earn 1% back in GoldCoins on every NFC debit card purchase. Spend gold, earn more gold.", coins: "1% cashback" },
          { icon: Star, title: "Loyalty Tiers", desc: "Reach Bronze, Silver, Gold, Platinum, Diamond, or Legendary tier for multiplied GoldCoin earnings.", coins: "Up to 5x boost" },
        ].map((f, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}
            className="bg-slate-800 border border-white/10 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-400/20 flex items-center justify-center">
                <f.icon className="w-5 h-5 text-amber-400" />
              </div>
              <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-1 rounded-full">{f.coins}</span>
            </div>
            <h3 className="font-bold text-white mb-1.5">{f.title}</h3>
            <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
          </motion.div>
        ))}
      </div>
      <div className="bg-slate-800 border border-white/10 rounded-2xl p-8 mb-8">
        <h2 className="text-xl font-black text-white mb-4">Redeem GoldCoins</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "1g Gold Bar", coins: "75,000 GC", icon: "🥇" },
            { label: "10g Gold Bar", coins: "735,000 GC", icon: "🥇" },
            { label: "Fee Discount 50%", coins: "10,000 GC", icon: "💸" },
            { label: "Premium Tier", coins: "50,000 GC/mo", icon: "⭐" },
          ].map((r, i) => (
            <div key={i} className="bg-slate-700/50 rounded-xl p-4 text-center">
              <div className="text-2xl mb-2">{r.icon}</div>
              <div className="font-bold text-white text-sm">{r.label}</div>
              <div className="text-amber-400 text-xs font-semibold mt-1">{r.coins}</div>
            </div>
          ))}
        </div>
      </div>
    </PageLayout>
  );
}

// ─── Mining Partners ──────────────────────────────────────────────────────────
export function MiningPartnersPage() {
  const partners = [
    { name: "Barrick Gold", hq: "Toronto, Canada", production: "4.8M oz/year", reserves: "68M oz", since: "2020" },
    { name: "Newmont Corporation", hq: "Denver, USA", production: "6.0M oz/year", reserves: "96M oz", since: "2020" },
    { name: "AngloGold Ashanti", hq: "Johannesburg, SA", production: "2.8M oz/year", reserves: "30M oz", since: "2021" },
    { name: "Kinross Gold", hq: "Toronto, Canada", production: "2.1M oz/year", reserves: "30M oz", since: "2021" },
    { name: "Agnico Eagle", hq: "Toronto, Canada", production: "3.4M oz/year", reserves: "54M oz", since: "2022" },
    { name: "Gold Fields", hq: "Johannesburg, SA", production: "2.3M oz/year", reserves: "48M oz", since: "2022" },
    { name: "Harmony Gold", hq: "Johannesburg, SA", production: "1.4M oz/year", reserves: "36M oz", since: "2023" },
    { name: "Endeavour Mining", hq: "London, UK", production: "1.5M oz/year", reserves: "22M oz", since: "2023" },
  ];
  return (
    <PageLayout title="Gold Mining Partners" subtitle="GoldVaults sources 99.99% pure gold exclusively from 8 world-class, LBMA-certified mining companies operating across 4 continents." badge="⛏️ World-Class Partners" breadcrumb="Mining Partners">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-14">
        {partners.map((p, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}
            className="bg-slate-800 border border-white/10 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-400/20 flex items-center justify-center text-amber-400 font-black text-sm">
                {p.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="font-bold text-white">{p.name}</div>
                <div className="text-xs text-slate-400">{p.hq}</div>
              </div>
              <span className="ml-auto text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full">Partner since {p.since}</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-slate-700/50 rounded-xl p-3">
                <div className="text-xs text-slate-400 mb-0.5">Annual Production</div>
                <div className="font-bold text-white">{p.production}</div>
              </div>
              <div className="bg-slate-700/50 rounded-xl p-3">
                <div className="text-xs text-slate-400 mb-0.5">Proven Reserves</div>
                <div className="font-bold text-white">{p.reserves}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </PageLayout>
  );
}

// ─── Vault Audits ─────────────────────────────────────────────────────────────
export function VaultAuditsPage() {
  return (
    <PageLayout title="Vault Audit Reports" subtitle="Transparency is our foundation. Every gram of gold backing GVT tokens is independently audited quarterly. All reports are published publicly." badge="📋 Quarterly Audits" breadcrumb="Vault Audits">
      <div className="space-y-4 mb-14">
        {[
          { quarter: "Q1 2025", date: "March 31, 2025", auditor: "Deloitte & Touche", gold: "182,500g", gvt: "182,500", status: "Verified" },
          { quarter: "Q4 2024", date: "December 31, 2024", auditor: "PricewaterhouseCoopers", gold: "178,200g", gvt: "178,200", status: "Verified" },
          { quarter: "Q3 2024", date: "September 30, 2024", auditor: "Ernst & Young", gold: "165,800g", gvt: "165,800", status: "Verified" },
          { quarter: "Q2 2024", date: "June 30, 2024", auditor: "KPMG", gold: "142,300g", gvt: "142,300", status: "Verified" },
        ].map((a, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}
            className="bg-slate-800 border border-white/10 rounded-xl p-5 flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="font-black text-white">{a.quarter} Audit Report</span>
                <span className="px-2 py-0.5 bg-emerald-500/15 border border-emerald-400/25 text-emerald-400 text-xs font-bold rounded-full">✓ {a.status}</span>
              </div>
              <div className="text-xs text-slate-400 space-y-0.5">
                <div>Date: {a.date} · Auditor: {a.auditor}</div>
                <div>Gold Verified: {a.gold} · GVT Supply: {a.gvt} tokens · Ratio: 1:1 ✓</div>
              </div>
            </div>
            <button className="px-4 py-2 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/25 text-amber-400 text-xs font-bold rounded-xl transition-all shrink-0">
              Download PDF
            </button>
          </motion.div>
        ))}
      </div>
    </PageLayout>
  );
}

// ─── Blog ─────────────────────────────────────────────────────────────────────
export function BlogPage() {
  const posts = [
    { title: "Why Gold Outperforms in a Crypto Bear Market", date: "Jul 1, 2025", cat: "Investment", read: "5 min", excerpt: "When crypto markets correct, gold has historically held its value or appreciated. Here's how to use GoldVaults to hedge your portfolio." },
    { title: "How to Convert Bitcoin to Physical Gold in 3 Steps", date: "Jun 28, 2025", cat: "Tutorial", read: "3 min", excerpt: "A step-by-step guide to swapping BTC for a real gold bar on GoldVaults. From wallet deposit to vault confirmation." },
    { title: "GVT Token: The Future of Gold-Backed Digital Assets", date: "Jun 22, 2025", cat: "Product", read: "7 min", excerpt: "Deep dive into how GVT maintains its 1:1 gold peg, how audits work, and why it's different from other gold tokens." },
    { title: "Gold vs Bitcoin: Which is the Better Store of Value?", date: "Jun 15, 2025", cat: "Analysis", read: "8 min", excerpt: "5,000 years of gold vs 15 years of Bitcoin. We compare volatility, adoption, liquidity, and long-term wealth preservation." },
    { title: "Earning GoldCoins: The Complete Guide to Rewards", date: "Jun 10, 2025", cat: "Tutorial", read: "4 min", excerpt: "From daily challenges to referral bonuses — every way to earn GoldCoins and redeem them for real gold bars." },
    { title: "Q1 2025 Vault Audit Results: 182,500g Verified", date: "Apr 1, 2025", cat: "Transparency", read: "2 min", excerpt: "Our Q1 2025 independent vault audit has been completed by Deloitte. All 182,500g of gold backing GVT tokens verified." },
  ];
  return (
    <PageLayout title="GoldVaults Blog" subtitle="Gold investment insights, platform updates, market analysis, and tutorials from the GoldVaults team." badge="📰 Latest Articles" breadcrumb="Blog">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((p, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}
            className="bg-slate-800 border border-white/10 rounded-2xl p-5 hover:border-amber-400/30 transition-all cursor-pointer group">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2 py-0.5 bg-amber-500/15 text-amber-400 text-xs font-bold rounded-full">{p.cat}</span>
              <span className="text-xs text-slate-500">{p.read} read</span>
            </div>
            <h3 className="font-bold text-white mb-2 group-hover:text-amber-400 transition-colors leading-snug">{p.title}</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">{p.excerpt}</p>
            <div className="text-xs text-slate-500">{p.date}</div>
          </motion.div>
        ))}
      </div>
    </PageLayout>
  );
}

// ─── Careers ──────────────────────────────────────────────────────────────────
export function CareersPage() {
  return (
    <PageLayout title="Careers at GoldVaults" subtitle="Join the team building the future of gold investment. We're a remote-first company with team members across 20+ countries." badge="💼 We're Hiring" breadcrumb="Careers">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-14">
        {[
          { title: "Senior Blockchain Engineer", dept: "Engineering", location: "Remote", type: "Full-time" },
          { title: "Gold Markets Analyst", dept: "Research", location: "London / Remote", type: "Full-time" },
          { title: "Product Designer (UX/UI)", dept: "Design", location: "Remote", type: "Full-time" },
          { title: "Compliance Officer (EU)", dept: "Legal", location: "Frankfurt / Remote", type: "Full-time" },
          { title: "Growth Marketing Manager", dept: "Marketing", location: "Remote", type: "Full-time" },
          { title: "Customer Success Lead", dept: "Support", location: "Remote", type: "Full-time" },
        ].map((j, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}
            className="bg-slate-800 border border-white/10 rounded-xl p-5 flex items-center justify-between hover:border-amber-400/30 transition-all cursor-pointer group">
            <div>
              <div className="font-bold text-white group-hover:text-amber-400 transition-colors">{j.title}</div>
              <div className="text-xs text-slate-400 mt-1">{j.dept} · {j.location} · {j.type}</div>
            </div>
            <button className="px-3 py-1.5 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/25 text-amber-400 text-xs font-bold rounded-lg transition-all shrink-0">Apply</button>
          </motion.div>
        ))}
      </div>
      <div className="bg-gradient-to-r from-amber-600/20 via-amber-500/10 to-amber-600/20 border border-amber-400/20 rounded-2xl p-10 text-center">
        <h2 className="text-2xl font-black text-white mb-3">Don't See Your Role?</h2>
        <p className="text-slate-400 mb-6">We're always looking for exceptional talent. Send us your CV and tell us how you'd contribute to the future of gold investment.</p>
        <Link href="/contact"><button className="px-8 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-900 font-black rounded-xl transition-all">Get in Touch →</button></Link>
      </div>
    </PageLayout>
  );
}

// ─── Contact ──────────────────────────────────────────────────────────────────
export function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);
  return (
    <PageLayout title="Contact Us" subtitle="Our team is available 24/7 to help with any questions about buying gold, your account, or the platform." badge="📬 Get in Touch" breadcrumb="Contact">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-14">
        <div>
          <h2 className="text-xl font-black text-white mb-6">Send Us a Message</h2>
          {sent ? (
            <div className="bg-emerald-500/10 border border-emerald-400/25 rounded-2xl p-8 text-center">
              <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
              <h3 className="font-bold text-white mb-2">Message Sent!</h3>
              <p className="text-sm text-slate-400">We'll get back to you within 24 hours.</p>
            </div>
          ) : (
            <form onSubmit={e => { e.preventDefault(); setSent(true); }} className="space-y-4">
              {[
                { key: "name", label: "Full Name", type: "text", placeholder: "Your name" },
                { key: "email", label: "Email Address", type: "email", placeholder: "you@example.com" },
                { key: "subject", label: "Subject", type: "text", placeholder: "How can we help?" },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-xs text-slate-400 mb-1.5 block">{f.label}</label>
                  <input type={f.type} placeholder={f.placeholder} required
                    className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-xl text-white text-sm placeholder-slate-500 outline-none focus:border-amber-400/50 transition-colors"
                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} />
                </div>
              ))}
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block">Message</label>
                <textarea rows={5} placeholder="Tell us more..." required
                  className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-xl text-white text-sm placeholder-slate-500 outline-none focus:border-amber-400/50 transition-colors resize-none"
                  onChange={e => setForm(p => ({ ...p, message: e.target.value }))} />
              </div>
              <button type="submit" className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-900 font-black rounded-xl transition-all active:scale-[0.97]">
                Send Message →
              </button>
            </form>
          )}
        </div>
        <div className="space-y-5">
          <h2 className="text-xl font-black text-white mb-2">Other Ways to Reach Us</h2>
          {[
            { icon: Mail, title: "Email Support", value: "support@goldvaults.us", sub: "Response within 24 hours" },
            { icon: MessageSquare, title: "Live Chat", value: "Available 24/7 in-app", sub: "Average response: 2 minutes" },
            { icon: Phone, title: "Phone Support", value: "+1 (888) GOLD-VLT", sub: "Mon–Fri 9am–6pm EST" },
            { icon: MapPin, title: "Headquarters", value: "1 Canada Square, London E14 5AB", sub: "By appointment only" },
          ].map((c, i) => (
            <div key={i} className="flex gap-4 bg-slate-800 border border-white/10 rounded-xl p-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-400/20 flex items-center justify-center shrink-0">
                <c.icon className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <div className="font-bold text-white text-sm">{c.title}</div>
                <div className="text-sm text-amber-400">{c.value}</div>
                <div className="text-xs text-slate-500">{c.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageLayout>
  );
}

// ─── Gold vs Bitcoin ──────────────────────────────────────────────────────────
export function GoldVsBitcoinPage() {
  return (
    <PageLayout title="Gold vs Bitcoin" subtitle="Two of the world's most popular stores of value — but which is right for you? And why GoldVaults lets you own both." badge="⚖️ Comparison" breadcrumb="Gold vs Bitcoin">
      <div className="overflow-x-auto mb-14">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/8">
              <th className="text-left px-4 py-3 text-slate-400 font-semibold">Property</th>
              <th className="text-center px-4 py-3 text-amber-400 font-bold">🥇 Gold</th>
              <th className="text-center px-4 py-3 text-orange-400 font-bold">₿ Bitcoin</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["History", "5,000+ years", "15 years"],
              ["Volatility", "Low (5-15% annual)", "High (50-80% annual)"],
              ["Inflation Hedge", "Proven over millennia", "Unproven long-term"],
              ["Liquidity", "Extremely high ($186B/day)", "High ($28B/day)"],
              ["Physical Form", "Yes — bars, coins, jewelry", "No — digital only"],
              ["Portability", "Limited (weight/customs)", "Instant, borderless"],
              ["Divisibility", "Limited", "Highly divisible (8 decimals)"],
              ["Regulatory Risk", "Very low", "Moderate"],
              ["Energy Use", "Mining (established)", "Proof-of-Work (high energy)"],
              ["Correlation to Stocks", "Low / negative", "Moderate (increasing)"],
            ].map(([prop, gold, btc], i) => (
              <tr key={i} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                <td className="px-4 py-3 text-slate-400 font-medium">{prop}</td>
                <td className="px-4 py-3 text-center text-white">{gold}</td>
                <td className="px-4 py-3 text-center text-white">{btc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="bg-gradient-to-r from-amber-600/20 via-amber-500/10 to-amber-600/20 border border-amber-400/20 rounded-2xl p-10 text-center mb-8">
        <h2 className="text-2xl font-black text-white mb-3">Why Not Own Both?</h2>
        <p className="text-slate-400 mb-6 max-w-lg mx-auto">GoldVaults lets you use Bitcoin's speed and accessibility to acquire gold's stability and history. The best of both worlds — in one platform.</p>
        <Link href="/buy-gold"><button className="px-8 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-900 font-black rounded-xl transition-all">Buy Gold with BTC →</button></Link>
      </div>
    </PageLayout>
  );
}

// ─── Referral ─────────────────────────────────────────────────────────────────
export function ReferralPage() {
  return (
    <PageLayout title="Referral Program" subtitle="Earn 1,000 GoldCoins for every friend you refer who completes KYC and makes their first gold purchase. No limit on referrals." badge="🎁 Refer & Earn" breadcrumb="Referral Program">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
        {[
          { step: "1", title: "Share Your Link", desc: "Get your unique referral link from your dashboard and share it with friends via social media, email, or messaging apps." },
          { step: "2", title: "Friend Signs Up", desc: "Your friend creates a GoldVaults account using your link, completes KYC verification, and makes their first gold purchase." },
          { step: "3", title: "Both Earn GoldCoins", desc: "You earn 1,000 GoldCoins. Your friend earns 500 GoldCoins as a welcome bonus. Redeem for real gold bars." },
        ].map((s, i) => (
          <div key={i} className="bg-slate-800 border border-white/10 rounded-2xl p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-amber-500 text-slate-900 font-black text-lg flex items-center justify-center mx-auto mb-4">{s.step}</div>
            <h3 className="font-bold text-white mb-2">{s.title}</h3>
            <p className="text-sm text-slate-400 leading-relaxed">{s.desc}</p>
          </div>
        ))}
      </div>
      <div className="bg-slate-800 border border-white/10 rounded-2xl p-6 text-center mb-8">
        <div className="text-xs text-slate-400 mb-2">Your Referral Link</div>
        <div className="flex gap-2 max-w-md mx-auto">
          <div className="flex-1 bg-slate-700 border border-white/10 rounded-xl px-4 py-3 text-amber-400 text-sm font-mono truncate">goldvaults.us/ref/YOUR_CODE</div>
          <Link href="/dashboard"><button className="px-4 py-3 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold rounded-xl text-sm transition-all">Copy</button></Link>
        </div>
      </div>
    </PageLayout>
  );
}

// ─── Gold Price Alerts ────────────────────────────────────────────────────────
export function GoldPriceAlertsPage() {
  return (
    <PageLayout title="Gold Price Alerts" subtitle="Never miss a gold buying opportunity. Set custom price alerts for XAU, GVT, and crypto pairs. Get notified by push, email, or SMS." badge="🔔 Price Alerts" breadcrumb="Gold Price Alerts">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-14">
        <div className="bg-slate-800 border border-white/10 rounded-2xl p-6">
          <h2 className="text-lg font-black text-white mb-4">Create New Alert</h2>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">Asset</label>
              <select className="w-full bg-slate-700 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-amber-400/50">
                <option>XAU/USD — Gold</option>
                <option>GVT/USD — GoldVault Token</option>
                <option>BTC/USD — Bitcoin</option>
                <option>ETH/USD — Ethereum</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">Condition</label>
              <select className="w-full bg-slate-700 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-amber-400/50">
                <option>Price drops below</option>
                <option>Price rises above</option>
                <option>24h change exceeds</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">Target Price (USD)</label>
              <input type="number" placeholder="e.g. 2300" className="w-full bg-slate-700 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-amber-400/50" />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">Notify via</label>
              <div className="flex gap-3">
                {["Push", "Email", "SMS"].map(n => (
                  <label key={n} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" defaultChecked={n === "Push"} className="accent-amber-400" />
                    <span className="text-sm text-white">{n}</span>
                  </label>
                ))}
              </div>
            </div>
            <Link href="/dashboard"><button className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-900 font-black rounded-xl transition-all">Set Alert →</button></Link>
          </div>
        </div>
        <div>
          <h2 className="text-lg font-black text-white mb-4">Active Alerts</h2>
          <div className="space-y-3">
            {[
              { asset: "XAU/USD", cond: "Drops below $2,300", via: "Push + Email", active: true },
              { asset: "GVT/USD", cond: "Rises above $2,400", via: "Push", active: true },
              { asset: "BTC/USD", cond: "Drops below $60,000", via: "SMS", active: false },
            ].map((a, i) => (
              <div key={i} className={`bg-slate-800 border rounded-xl p-4 flex items-center justify-between ${a.active ? "border-amber-400/25" : "border-white/8 opacity-60"}`}>
                <div>
                  <div className="font-bold text-white text-sm">{a.asset}</div>
                  <div className="text-xs text-slate-400">{a.cond} · {a.via}</div>
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${a.active ? "bg-emerald-500/15 text-emerald-400" : "bg-slate-700 text-slate-500"}`}>
                  {a.active ? "Active" : "Paused"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

// ─── Social Hub Page ──────────────────────────────────────────────────────────
export function SocialHubPage() {
  return (
    <PageLayout title="Social Hub" subtitle="Connect with 5M+ gold investors. Share trades, chat with friends, upload photos and videos, and earn GoldCoins for engagement." badge="👥 Community" breadcrumb="Social">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-800 border border-white/10 rounded-2xl p-6">
            <h3 className="font-bold text-white mb-4">Community Feed</h3>
            {[
              { user: "Alex Chen", handle: "@alexchen", time: "2m ago", msg: "Just minted my first 10oz gold bar using BTC! The process was seamless 🥇", likes: 142, comments: 23, avatar: "AC" },
              { user: "Maria Santos", handle: "@mariasantos", time: "15m ago", msg: "Gold is up 0.82% today. Stacking more GVT while crypto dips. Classic hedge strategy 📈", likes: 89, comments: 11, avatar: "MS" },
              { user: "James Wu", handle: "@jameswu", time: "1h ago", msg: "Completed the Gold Rush Weekly Challenge — earned 500 GoldCoins! Almost enough for a 1g bar 🎯", likes: 234, comments: 45, avatar: "JW" },
            ].map((post, i) => (
              <div key={i} className="border-b border-white/8 pb-4 mb-4 last:border-0 last:mb-0 last:pb-0">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400 font-bold text-sm shrink-0">{post.avatar}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-white text-sm">{post.user}</span>
                      <span className="text-slate-500 text-xs">{post.handle}</span>
                      <span className="text-slate-600 text-xs ml-auto">{post.time}</span>
                    </div>
                    <p className="text-slate-300 text-sm leading-relaxed">{post.msg}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                      <button className="hover:text-amber-400 transition-colors">❤️ {post.likes}</button>
                      <button className="hover:text-amber-400 transition-colors">💬 {post.comments}</button>
                      <button className="hover:text-amber-400 transition-colors">🔗 Share</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <div className="bg-slate-800 border border-white/10 rounded-2xl p-5">
            <h3 className="font-bold text-white mb-3">Online Friends</h3>
            {[
              { name: "Alex Chen", status: "Trading XAU/USD", avatar: "AC" },
              { name: "Maria Santos", status: "Minting gold bars", avatar: "MS" },
              { name: "James Wu", status: "Completing challenges", avatar: "JW" },
              { name: "Sarah Kim", status: "Viewing markets", avatar: "SK" },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3 py-2.5 border-b border-white/5 last:border-0">
                <div className="relative">
                  <div className="w-9 h-9 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-xs">{f.avatar}</div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-slate-800" />
                </div>
                <div>
                  <div className="text-sm font-medium text-white">{f.name}</div>
                  <div className="text-xs text-slate-500">{f.status}</div>
                </div>
                <button className="ml-auto text-xs text-amber-400 hover:text-amber-300 transition-colors">Chat</button>
              </div>
            ))}
          </div>
          <div className="bg-gradient-to-br from-amber-600/20 to-amber-500/10 border border-amber-400/20 rounded-2xl p-5 text-center">
            <div className="text-3xl mb-2">🏆</div>
            <div className="font-bold text-white mb-1">Top Contributor</div>
            <div className="text-xs text-slate-400 mb-3">Share a post to earn 10 GoldCoins</div>
            <button className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold rounded-xl text-sm transition-colors">Post Now</button>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

// ─── Game Challenges Page ─────────────────────────────────────────────────────
export function ChallengesPage() {
  return (
    <PageLayout title="Game Challenges" subtitle="Complete daily and weekly challenges to earn GoldCoins. Redeem your coins for real gold bars, fee discounts, and exclusive rewards." badge="🎮 Earn Gold" breadcrumb="Challenges">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">⚡ Daily Challenges <span className="text-xs text-slate-500 font-normal">Resets in 14h 22m</span></h3>
            <div className="space-y-3">
              {[
                { title: "First Trade of the Day", desc: "Complete any trade on the exchange", reward: 50, progress: 0, total: 1 },
                { title: "Gold Watcher", desc: "Check gold price 3 times", reward: 20, progress: 2, total: 3 },
                { title: "Social Butterfly", desc: "Post in the community feed", reward: 30, progress: 0, total: 1 },
                { title: "Referral Boost", desc: "Share your referral link", reward: 25, progress: 1, total: 1, done: true },
              ].map((c, i) => (
                <div key={i} className={`bg-slate-800 border rounded-xl p-4 ${c.done ? "border-amber-400/30 bg-amber-500/5" : "border-white/10"}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="font-bold text-white text-sm">{c.title}</div>
                      <div className="text-xs text-slate-400">{c.desc}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-amber-400 font-black">+{c.reward}</div>
                      <div className="text-xs text-slate-500">GoldCoins</div>
                    </div>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-1.5">
                    <div className="bg-amber-400 h-1.5 rounded-full transition-all" style={{ width: `${(c.progress / c.total) * 100}%` }} />
                  </div>
                  <div className="text-xs text-slate-500 mt-1">{c.progress}/{c.total} completed</div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">🏆 Weekly Challenges <span className="text-xs text-slate-500 font-normal">Resets in 4d 8h</span></h3>
            <div className="space-y-3">
              {[
                { title: "Gold Accumulator", desc: "Buy gold worth $100+ this week", reward: 200, progress: 65, total: 100 },
                { title: "Community Leader", desc: "Get 50 likes on your posts", reward: 150, progress: 23, total: 50 },
                { title: "Crypto Converter", desc: "Convert 3 different cryptos to gold", reward: 300, progress: 1, total: 3 },
              ].map((c, i) => (
                <div key={i} className="bg-slate-800 border border-white/10 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="font-bold text-white text-sm">{c.title}</div>
                      <div className="text-xs text-slate-400">{c.desc}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-amber-400 font-black">+{c.reward}</div>
                      <div className="text-xs text-slate-500">GoldCoins</div>
                    </div>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-1.5">
                    <div className="bg-amber-400 h-1.5 rounded-full transition-all" style={{ width: `${(c.progress / c.total) * 100}%` }} />
                  </div>
                  <div className="text-xs text-slate-500 mt-1">{c.progress}/{c.total} completed</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="bg-slate-800 border border-white/10 rounded-2xl p-5 text-center">
            <div className="text-4xl font-black text-amber-400 mb-1">12,400</div>
            <div className="text-slate-400 text-sm mb-3">Your GoldCoins Balance</div>
            <div className="text-xs text-slate-500 mb-4">≈ 5.3g of gold redeemable</div>
            <Link href="/goldcoins"><button className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold rounded-xl text-sm transition-colors">Redeem Coins</button></Link>
          </div>
          <div className="bg-slate-800 border border-white/10 rounded-2xl p-5">
            <h3 className="font-bold text-white mb-3 text-sm">Leaderboard</h3>
            {[
              { rank: 1, name: "CryptoKing99", coins: "48,200", medal: "🥇" },
              { rank: 2, name: "GoldHunter", coins: "41,500", medal: "🥈" },
              { rank: 3, name: "VaultMaster", coins: "38,900", medal: "🥉" },
              { rank: 8, name: "You", coins: "12,400", medal: "⭐" },
            ].map((p, i) => (
              <div key={i} className={`flex items-center gap-3 py-2 border-b border-white/5 last:border-0 ${p.name === "You" ? "text-amber-400" : ""}`}>
                <span className="text-lg">{p.medal}</span>
                <span className="text-sm font-medium flex-1 text-white">{p.name}</span>
                <span className="text-xs text-amber-400 font-bold">{p.coins}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

// ─── Gold ETF Wallet Page ─────────────────────────────────────────────────────
export function GoldETFPage() {
  const etfs = [
    { symbol: "GLD", name: "SPDR Gold Shares", price: "$185.40", change: "+0.82%", aum: "$58.2B", up: true },
    { symbol: "IAU", name: "iShares Gold Trust", price: "$37.08", change: "+0.81%", aum: "$28.4B", up: true },
    { symbol: "GLDM", name: "SPDR Gold MiniShares", price: "$37.10", change: "+0.82%", aum: "$9.1B", up: true },
    { symbol: "SGOL", name: "Aberdeen Physical Gold", price: "$19.42", change: "+0.80%", aum: "$2.8B", up: true },
    { symbol: "AAAU", name: "Perth Mint Physical Gold", price: "$19.38", change: "+0.79%", aum: "$0.7B", up: true },
    { symbol: "PAXG", name: "Pax Gold Token", price: "$2,338.20", change: "+0.79%", aum: "$640M", up: true },
    { symbol: "XAUT", name: "Tether Gold", price: "$2,337.80", change: "+0.78%", aum: "$580M", up: true },
    { symbol: "GVT", name: "GoldVault Token", price: "$2,340.50", change: "+0.82%", aum: "$890M", up: true },
  ];
  return (
    <PageLayout title="Gold ETF Wallet" subtitle="Hold, track, and trade gold-backed ETFs and tokens in one unified wallet. Real gold exposure, crypto-speed settlement." badge="🏅 Gold ETFs" breadcrumb="Gold ETF Wallet">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Portfolio Value", value: "$34,782", change: "+$284 today" },
          { label: "Gold Holdings", value: "14.87 oz", change: "≈ 462g" },
          { label: "Today's Gain", value: "+$284", change: "+0.82%" },
          { label: "Total Return", value: "+18.4%", change: "Since inception" },
        ].map((s, i) => (
          <div key={i} className="bg-slate-800 border border-white/10 rounded-xl p-5">
            <div className="text-xs text-slate-400 mb-1">{s.label}</div>
            <div className="text-2xl font-black text-white">{s.value}</div>
            <div className="text-xs text-green-400 mt-1">{s.change}</div>
          </div>
        ))}
      </div>
      <div className="bg-slate-800 border border-white/10 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/8">
              <th className="text-left text-xs text-slate-400 font-medium px-6 py-3">Asset</th>
              <th className="text-right text-xs text-slate-400 font-medium px-6 py-3">Price</th>
              <th className="text-right text-xs text-slate-400 font-medium px-6 py-3">24h Change</th>
              <th className="text-right text-xs text-slate-400 font-medium px-6 py-3">AUM</th>
              <th className="text-right text-xs text-slate-400 font-medium px-6 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {etfs.map((e, i) => (
              <tr key={i} className="border-b border-white/5 last:border-0 hover:bg-white/3 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 font-black text-xs">{e.symbol.slice(0, 2)}</div>
                    <div>
                      <div className="font-bold text-white text-sm">{e.symbol}</div>
                      <div className="text-xs text-slate-400">{e.name}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-right font-bold text-white text-sm">{e.price}</td>
                <td className="px-6 py-4 text-right">
                  <span className={`text-sm font-bold ${e.up ? "text-green-400" : "text-red-400"}`}>{e.change}</span>
                </td>
                <td className="px-6 py-4 text-right text-slate-400 text-sm">{e.aum}</td>
                <td className="px-6 py-4 text-right">
                  <button className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold rounded-lg text-xs transition-colors">Buy</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageLayout>
  );
}

// ─── Bitcoin Wallet Page ──────────────────────────────────────────────────────
export function BitcoinWalletPage() {
  return (
    <PageLayout title="Bitcoin Wallet" subtitle="Send, receive, and manage Bitcoin directly from your GoldVaults wallet. Instantly convert BTC to physical gold." badge="₿ Bitcoin" breadcrumb="Bitcoin Wallet">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-slate-800 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white">BTC Balance</h3>
              <span className="text-xs text-slate-400 bg-slate-700 px-2 py-1 rounded">Mainnet</span>
            </div>
            <div className="text-4xl font-black text-white mb-1">0.2847 BTC</div>
            <div className="text-slate-400 text-sm mb-4">≈ $19,190.27 USD</div>
            <div className="flex gap-3">
              <Link href="/send-btc"><button className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold rounded-xl text-sm transition-colors">Send BTC</button></Link>
              <button className="flex-1 py-2.5 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl text-sm transition-colors">Receive</button>
              <Link href="/buy-gold"><button className="flex-1 py-2.5 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl text-sm transition-colors">→ Gold</button></Link>
            </div>
          </div>
          <div className="bg-slate-800 border border-white/10 rounded-2xl p-6">
            <h3 className="font-bold text-white mb-4">Recent Transactions</h3>
            {[
              { type: "Received", amount: "+0.05 BTC", value: "$3,371", time: "2h ago", hash: "bc1q...3f8a" },
              { type: "Converted to Gold", amount: "-0.02 BTC", value: "$1,348", time: "1d ago", hash: "bc1q...9c2d" },
              { type: "Sent", amount: "-0.01 BTC", value: "$674", time: "3d ago", hash: "bc1q...7e1b" },
            ].map((tx, i) => (
              <div key={i} className="flex items-center gap-3 py-3 border-b border-white/5 last:border-0">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm ${tx.type === "Received" ? "bg-green-500/20 text-green-400" : tx.type === "Converted to Gold" ? "bg-amber-500/20 text-amber-400" : "bg-red-500/20 text-red-400"}`}>
                  {tx.type === "Received" ? "↓" : tx.type === "Converted to Gold" ? "🥇" : "↑"}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-white">{tx.type}</div>
                  <div className="text-xs text-slate-500">{tx.hash} · {tx.time}</div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-bold ${tx.amount.startsWith("+") ? "text-green-400" : "text-red-400"}`}>{tx.amount}</div>
                  <div className="text-xs text-slate-500">{tx.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-amber-600/20 to-amber-500/10 border border-amber-400/20 rounded-2xl p-6">
            <h3 className="font-bold text-white mb-2">Convert BTC → Gold</h3>
            <p className="text-slate-400 text-sm mb-4">Turn your Bitcoin into physical gold instantly. 0.1% fee, 2-minute settlement.</p>
            <div className="bg-slate-800/50 rounded-xl p-4 mb-3">
              <div className="text-xs text-slate-400 mb-1">You send</div>
              <div className="flex items-center gap-2">
                <span className="text-amber-400 font-bold">₿</span>
                <input defaultValue="0.05" className="bg-transparent text-white font-bold text-xl flex-1 outline-none" />
                <span className="text-slate-400 text-sm">BTC</span>
              </div>
            </div>
            <div className="text-center text-slate-500 my-2">↓</div>
            <div className="bg-slate-800/50 rounded-xl p-4 mb-4">
              <div className="text-xs text-slate-400 mb-1">You receive</div>
              <div className="text-white font-bold text-xl">≈ 70.00 GVT</div>
              <div className="text-xs text-slate-500">backed by physical gold</div>
            </div>
            <Link href="/buy-gold"><button className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-900 font-black rounded-xl transition-colors">Convert Now →</button></Link>
          </div>
          <div className="bg-slate-800 border border-white/10 rounded-2xl p-5">
            <h3 className="font-bold text-white mb-3 text-sm">Wallet Security</h3>
            {[
              { label: "2FA Enabled", status: "Active", ok: true },
              { label: "Withdrawal Whitelist", status: "3 addresses", ok: true },
              { label: "Anti-Phishing Code", status: "Set", ok: true },
              { label: "Biometric Lock", status: "Enabled", ok: true },
            ].map((s, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <span className="text-sm text-slate-300">{s.label}</span>
                <span className={`text-xs font-bold ${s.ok ? "text-green-400" : "text-red-400"}`}>{s.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

// ─── Mint Gold Bars Page ──────────────────────────────────────────────────────
export function MintPage() {
  const tiers = [
    { weight: "1g", label: "Micro Bar", coins: 1000, usd: "$74", popular: false },
    { weight: "10g", label: "Standard Bar", coins: 9500, usd: "$740", popular: true },
    { weight: "1oz", label: "Premium Bar", coins: 29000, usd: "$2,340", popular: false },
    { weight: "10oz", label: "Vault Bar", coins: 285000, usd: "$23,400", popular: false },
  ];
  return (
    <PageLayout title="Mint Gold Bars" subtitle="Convert your GoldCoins into real, LBMA-certified gold bars. Stored in insured vaults or delivered to your door." badge="🏅 Mint Gold" breadcrumb="Mint Gold Bars">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-3 bg-amber-500/15 border border-amber-400/25 rounded-2xl px-6 py-3">
          <span className="text-amber-400 font-bold text-sm">Your Balance:</span>
          <span className="text-white font-black text-xl">12,400 GoldCoins</span>
          <span className="text-slate-400 text-sm">≈ 5.3g redeemable</span>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {tiers.map((t, i) => (
          <div key={i} className={`relative bg-slate-800 border rounded-2xl p-6 text-center ${t.popular ? "border-amber-400/50 shadow-lg shadow-amber-500/10" : "border-white/10"}`}>
            {t.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-900 text-xs font-black px-3 py-1 rounded-full">MOST POPULAR</div>}
            <div className="text-5xl mb-3">🥇</div>
            <div className="text-3xl font-black text-white mb-1">{t.weight}</div>
            <div className="text-slate-400 text-sm mb-4">{t.label}</div>
            <div className="text-amber-400 font-black text-xl mb-1">{t.coins.toLocaleString()}</div>
            <div className="text-slate-500 text-xs mb-4">GoldCoins</div>
            <div className="text-slate-300 text-sm mb-5">≈ {t.usd} USD</div>
            <button className={`w-full py-2.5 font-bold rounded-xl text-sm transition-colors ${t.popular ? "bg-amber-500 hover:bg-amber-400 text-slate-900" : "bg-slate-700 hover:bg-slate-600 text-white"}`}>
              Mint Now
            </button>
          </div>
        ))}
      </div>
      <div className="bg-slate-800 border border-white/10 rounded-2xl p-8">
        <h3 className="font-bold text-white text-xl mb-6 text-center">How Minting Works</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { step: "01", title: "Select Denomination", desc: "Choose from 1g micro bars to 10oz vault bars" },
            { step: "02", title: "Confirm GoldCoins", desc: "Review the GoldCoin cost and confirm the swap" },
            { step: "03", title: "Blockchain Minting", desc: "Your GVT token is minted on-chain in under 2 minutes" },
            { step: "04", title: "Store or Deliver", desc: "Hold in vault or request physical delivery worldwide" },
          ].map((s, i) => (
            <div key={i} className="text-center">
              <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400 font-black mx-auto mb-3">{s.step}</div>
              <div className="font-bold text-white text-sm mb-1">{s.title}</div>
              <div className="text-xs text-slate-400">{s.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </PageLayout>
  );
}

// ─── Trade Page ───────────────────────────────────────────────────────────────
function LegalPage({ title, badge, sections }: { title: string; badge: string; sections: { heading: string; body: string }[] }) {
  return (
    <PageLayout badge={badge} title={title} subtitle="Please read this document carefully before using GoldVaults.us." breadcrumb={title}>
      <div className="max-w-3xl mx-auto space-y-8">
        {sections.map((s, i) => (
          <div key={i}>
            <h2 className="text-xl font-bold text-white mb-3">{s.heading}</h2>
            <p className="text-slate-400 leading-relaxed text-sm">{s.body}</p>
          </div>
        ))}
        <div className="bg-slate-800 border border-amber-400/20 rounded-2xl p-5 text-sm text-slate-400">
          Last updated: January 1, 2025. For questions, contact <span className="text-amber-400">legal@goldvaults.us</span>
        </div>
      </div>
    </PageLayout>
  );
}

export function PrivacyPolicyPage() {
  return (
    <LegalPage
      badge="🔒 Privacy"
      title="Privacy Policy"
      sections={[
        { heading: "1. Information We Collect", body: "We collect information you provide directly (name, email, phone, identity documents for KYC), information generated by your use of the platform (transaction history, wallet addresses, device identifiers, IP addresses), and information from third-party partners (blockchain analytics, identity verification providers)." },
        { heading: "2. How We Use Your Information", body: "We use your information to provide and improve our services, process transactions, verify your identity (KYC/AML compliance), send service notifications and marketing communications (with your consent), detect and prevent fraud, and comply with legal obligations." },
        { heading: "3. Information Sharing", body: "We do not sell your personal information. We share data with trusted service providers (cloud hosting, identity verification, payment processors), regulatory authorities when required by law, and in the event of a merger or acquisition with appropriate notice." },
        { heading: "4. Data Security", body: "We implement industry-standard security measures including AES-256 encryption at rest, TLS 1.3 in transit, multi-factor authentication, cold storage for digital assets, and regular third-party security audits (ISO 27001, SOC 2 Type II)." },
        { heading: "5. Your Rights", body: "Depending on your jurisdiction, you may have rights to access, correct, delete, or port your personal data. You may also object to certain processing or withdraw consent. Contact privacy@goldvaults.us to exercise these rights." },
        { heading: "6. Cookies", body: "We use essential cookies for authentication and security, analytics cookies to understand usage patterns, and marketing cookies (with consent) to deliver relevant advertisements. You can manage cookie preferences in your browser settings." },
        { heading: "7. Contact Us", body: "For privacy-related inquiries, contact our Data Protection Officer at privacy@goldvaults.us or write to GoldVaults Inc., 1 Financial Plaza, New York, NY 10004, USA." },
      ]}
    />
  );
}

export function TermsPage() {
  return (
    <LegalPage
      badge="📄 Terms"
      title="Terms of Service"
      sections={[
        { heading: "1. Acceptance of Terms", body: "By accessing or using GoldVaults.us, you agree to be bound by these Terms of Service. If you do not agree, do not use our services. We may update these terms at any time with notice." },
        { heading: "2. Eligibility", body: "You must be at least 18 years old and legally permitted to use financial services in your jurisdiction. GoldVaults services are not available in sanctioned countries or to persons on OFAC, EU, or UN sanctions lists." },
        { heading: "3. Account Registration & KYC", body: "You must provide accurate information during registration and complete identity verification (KYC) before accessing full platform features. You are responsible for maintaining the security of your account credentials." },
        { heading: "4. Gold Products & Tokenization", body: "GVT tokens represent a claim on physical gold stored in our vaults. Each GVT is backed 1:1 by 99.99% pure gold. Redemption for physical delivery is subject to minimum quantities, delivery fees, and processing times." },
        { heading: "5. Trading & Transactions", body: "All trades are final once confirmed. Cryptocurrency transactions are irreversible. GoldVaults is not responsible for losses due to market volatility, user error, or network congestion. Past performance does not guarantee future results." },
        { heading: "6. Fees", body: "We charge a 0.1% platform fee on gold swaps, network fees for blockchain transactions (passed through at cost), and storage fees for physical gold (0.15% annually). Fee schedules are published on our website and may change with notice." },
        { heading: "7. Limitation of Liability", body: "To the maximum extent permitted by law, GoldVaults shall not be liable for indirect, incidental, or consequential damages. Our total liability shall not exceed the fees paid by you in the 12 months preceding the claim." },
      ]}
    />
  );
}

export function CookiePolicyPage() {
  return (
    <LegalPage
      badge="🍪 Cookies"
      title="Cookie Policy"
      sections={[
        { heading: "What Are Cookies?", body: "Cookies are small text files placed on your device when you visit our website. They help us recognize you, remember your preferences, and improve your experience on GoldVaults.us." },
        { heading: "Essential Cookies", body: "These cookies are necessary for the website to function. They enable core features like authentication, security, and session management. You cannot opt out of essential cookies without disabling the website." },
        { heading: "Analytics Cookies", body: "We use analytics cookies (via our own analytics platform) to understand how visitors interact with our site — which pages are most visited, how long users stay, and where they navigate from. This data is anonymized and aggregated." },
        { heading: "Marketing Cookies", body: "With your consent, we use marketing cookies to deliver relevant advertisements on third-party platforms. These cookies track your browsing across sites to build a profile of your interests." },
        { heading: "Managing Cookies", body: "You can manage or disable cookies through your browser settings. Note that disabling certain cookies may affect the functionality of GoldVaults.us. You can also update your cookie preferences at any time via the cookie banner." },
      ]}
    />
  );
}

export function RiskDisclosurePage() {
  return (
    <LegalPage
      badge="⚠️ Risk"
      title="Risk Disclosure"
      sections={[
        { heading: "Cryptocurrency Risk", body: "Cryptocurrencies are highly volatile assets. The value of BTC, ETH, and other cryptocurrencies can fluctuate dramatically within short periods. You may lose some or all of your invested capital. Never invest more than you can afford to lose." },
        { heading: "Gold Price Risk", body: "While gold has historically been a store of value, its price can and does fluctuate. GVT token prices are directly linked to the spot price of gold (XAU/USD). Past performance of gold prices is not indicative of future results." },
        { heading: "Regulatory Risk", body: "The regulatory landscape for cryptocurrencies and tokenized assets is evolving. Changes in laws or regulations in your jurisdiction may affect your ability to use GoldVaults services or the value of your holdings." },
        { heading: "Custody & Vault Risk", body: "While we maintain comprehensive insurance and conduct quarterly independent audits, no custodial arrangement is entirely risk-free. In the unlikely event of a vault breach or insolvency, your gold holdings may be affected." },
        { heading: "Technology Risk", body: "Blockchain networks, smart contracts, and software systems can contain bugs or be subject to attacks. We employ rigorous security practices, but no system is 100% secure. Always use strong passwords and enable two-factor authentication." },
        { heading: "Liquidity Risk", body: "In extreme market conditions, it may be difficult to execute trades at desired prices. Physical gold redemption requests may take 5-10 business days to process. Ensure you maintain adequate liquid reserves for your needs." },
        { heading: "Seek Professional Advice", body: "GoldVaults does not provide financial, tax, or legal advice. Before making investment decisions, consult with qualified financial and tax advisors who understand your personal circumstances and jurisdiction." },
      ]}
    />
  );
}
