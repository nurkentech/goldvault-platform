import { useState } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Star, ChevronDown, Send, Twitter, Facebook, Instagram, Youtube, Linkedin, Github, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { openSignUpModal } from "@/pages/Home";

// ─── Testimonials ────────────────────────────────────────────────────────────
const TESTIMONIALS = [
  { name: "Michael Chen", role: "Crypto Investor → Gold Holder", location: "Hong Kong", rating: 5, text: "I converted 2 BTC into tokenized gold on GoldVaults and within 90 seconds I had a GVT balance backed by real, vault-stored gold. Then I minted a 1oz bar and had it delivered to my door. This is the future.", avatar: "MC" },
  { name: "Sarah Williams", role: "Portfolio Manager", location: "London, UK", rating: 5, text: "I use GoldVaults to hedge my clients' crypto portfolios. When BTC drops, their gold allocation holds value. The PAXG and XAUT tokens are perfect — real gold, on-chain, redeemable anytime. Brilliant platform.", avatar: "SW" },
  { name: "Ahmed Al-Rashid", role: "Gold Investor", location: "Dubai, UAE", rating: 5, text: "I've been buying physical gold for 20 years. GoldVaults lets me do it with USDT in under 2 minutes. The vault audit reports are transparent, the gold is 99.99% pure, and the fees are far lower than my local dealer.", avatar: "AA" },
  { name: "Priya Sharma", role: "Wealth Manager", location: "Mumbai, India", rating: 5, text: "My clients love that they can diversify into gold without leaving the crypto ecosystem. The Gold ETF wallet (GLD, IAU, SGOL) gives them exposure to institutional gold products right alongside their BTC and ETH.", avatar: "PS" },
  { name: "Carlos Mendoza", role: "Crypto Entrepreneur", location: "São Paulo, Brazil", rating: 5, text: "The GoldCoins game challenges are addictive — I've earned enough to mint a 10g gold bar just by completing daily tasks and referring friends. GoldVaults turned gold investing into something genuinely fun.", avatar: "CM" },
  { name: "Emma Thompson", role: "First-Time Gold Buyer", location: "Sydney, Australia", rating: 5, text: "I had ETH sitting idle and didn't know what to do with it. GoldVaults let me swap it for a 1g gold bar in minutes. The AI support walked me through every step. I now own real gold for the first time in my life.", avatar: "ET" },
];

export function Testimonials() {
  const [current, setCurrent] = useState(0);
  const visibleCount = 3;
  const maxStart = TESTIMONIALS.length - visibleCount;

  const prev = () => setCurrent(c => Math.max(0, c - 1));
  const next = () => setCurrent(c => Math.min(maxStart, c + 1));

  const visible = TESTIMONIALS.slice(current, current + visibleCount);

  return (
    <section className="bg-slate-800/40 py-20">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-6">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-amber-400 text-sm font-semibold uppercase tracking-wider mb-2">Community</p>
            <h2 className="text-4xl font-black text-white">What Traders Say</h2>
          </div>
          <div className="flex gap-2">
            <button onClick={prev} disabled={current === 0} className="p-2.5 rounded-xl bg-slate-800 border border-white/10 text-white hover:border-amber-400/30 disabled:opacity-30 transition-all">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={next} disabled={current >= maxStart} className="p-2.5 rounded-xl bg-slate-800 border border-white/10 text-white hover:border-amber-400/30 disabled:opacity-30 transition-all">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence mode="popLayout">
            {visible.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ delay: i * 0.08, duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
                className="bg-slate-800 border border-white/8 rounded-2xl p-6"
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-slate-300 leading-relaxed mb-5 italic">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400 font-black text-sm">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="font-bold text-white text-sm">{t.name}</div>
                    <div className="text-xs text-slate-400">{t.role} · {t.location}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: maxStart + 1 }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`transition-all rounded-full ${i === current ? "w-6 h-2 bg-amber-400" : "w-2 h-2 bg-white/20 hover:bg-white/40"}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Mobile App ──────────────────────────────────────────────────────────────
export function MobileApp() {
  return (
    <section className="bg-slate-900 py-20 overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-6">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex-1"
          >
            <p className="text-amber-400 text-sm font-semibold uppercase tracking-wider mb-3">Mobile Trading</p>
            <h2 className="text-4xl font-black text-white mb-4">Trade On The Go</h2>
            <p className="text-slate-400 leading-relaxed mb-6">
              Download the GoldVaults app and trade from anywhere in the world. Full-featured mobile trading with real-time alerts, biometric security, and instant deposits.
            </p>
            <ul className="space-y-3 mb-8">
              {["Real-time push notifications for price alerts", "Face ID & fingerprint authentication", "Instant crypto-to-fiat conversion", "NFC tap-to-pay with GoldVaults card", "Offline portfolio tracking"].map((f, i) => (
                <li key={i} className="flex items-center gap-2.5 text-sm text-slate-300">
                  <span className="w-5 h-5 rounded-full bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-400 text-xs font-bold shrink-0">✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => toast.info("App Store coming soon!", { description: "The GoldVaults iOS app is launching soon. Stay tuned!" })}
                className="flex items-center gap-3 px-5 py-3 bg-white text-slate-900 rounded-xl font-bold text-sm hover:bg-slate-100 transition-all active:scale-[0.97]"
              >
                <span className="text-xl">🍎</span>
                <div className="text-left">
                  <div className="text-xs text-slate-500">Download on the</div>
                  <div className="font-black">App Store</div>
                </div>
              </button>
              <button
                onClick={() => toast.info("Google Play coming soon!", { description: "The GoldVaults Android app is launching soon. Stay tuned!" })}
                className="flex items-center gap-3 px-5 py-3 bg-white text-slate-900 rounded-xl font-bold text-sm hover:bg-slate-100 transition-all active:scale-[0.97]"
              >
                <span className="text-xl">🤖</span>
                <div className="text-left">
                  <div className="text-xs text-slate-500">Get it on</div>
                  <div className="font-black">Google Play</div>
                </div>
              </button>
            </div>
          </motion.div>

          {/* Phone mockup */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex-1 flex justify-center"
          >
            <div className="relative">
              <motion.div
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="w-64 h-[520px] bg-slate-800 border-4 border-slate-700 rounded-[3rem] shadow-2xl shadow-amber-500/10 overflow-hidden relative"
              >
                {/* Phone notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-slate-700 rounded-b-2xl z-10" />
                {/* Screen content */}
                <div className="h-full bg-gradient-to-b from-slate-900 to-slate-800 pt-10 px-4 pb-4 flex flex-col">
                  <div className="text-center mb-4">
                    <div className="text-xs text-slate-400 mb-1">Portfolio Value</div>
                    <div className="text-2xl font-black text-white">$34,782</div>
                    <div className="text-xs text-emerald-400 font-semibold">+$1,234 (+3.7%) today</div>
                  </div>
                  <div className="flex-1 bg-slate-700/50 rounded-2xl p-3 mb-3">
                    <div className="text-xs text-slate-400 mb-2">Holdings</div>
                    {[
                      { sym: "BTC", val: "$18,420", pct: "+2.3%" },
                      { sym: "ETH", val: "$9,240", pct: "+1.9%" },
                      { sym: "GVT", val: "$4,120", pct: "+5.1%" },
                      { sym: "GOLD", val: "$3,002", pct: "+0.8%" },
                    ].map(h => (
                      <div key={h.sym} className="flex justify-between items-center py-1.5 border-b border-white/5 last:border-0">
                        <span className="text-xs font-bold text-white">{h.sym}</span>
                        <span className="text-xs text-slate-300">{h.val}</span>
                        <span className="text-xs text-emerald-400 font-semibold">{h.pct}</span>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {["Buy", "Sell", "Send"].map(btn => (
                      <button
                        key={btn}
                        onClick={() => openSignUpModal("signup")}
                        className="py-2 rounded-xl bg-amber-500/20 border border-amber-400/30 text-amber-400 text-xs font-bold"
                      >
                        {btn}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
              {/* Glow */}
              <div className="absolute -inset-4 bg-amber-500/10 rounded-full blur-2xl -z-10" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ─── FAQ ─────────────────────────────────────────────────────────────────────
const FAQ_ITEMS = [
  { q: "How do I buy physical gold with crypto on GoldVaults?", a: "Simply sign up, deposit any supported cryptocurrency (BTC, ETH, USDT, SOL, and 300+ more), then navigate to the Gold Minting tab. Select your gold denomination (1g, 10g, 1oz, or 10oz), confirm the swap, and your GVT tokens are backed by real, vault-stored gold within 2 minutes." },
  { q: "Is the gold real and where is it stored?", a: "Yes — 100% real, 99.99% pure gold. All physical gold is stored in insured, audited vaults operated by our 8 world-class mining partners including Barrick Gold and Newmont. Quarterly independent audits verify every gram. You can redeem for physical delivery at any time." },
  { q: "What is GVT (GoldVault Token)?", a: "GVT is GoldVaults' native gold-backed token. Each GVT is pegged 1:1 to a fixed weight of 99.99% pure gold held in our vaults. You can hold GVT in your wallet, trade it, or redeem it for a physical gold bar delivered to your address." },
  { q: "What are GoldCoins and how do I earn them?", a: "GoldCoins are GoldVaults' reward currency. Earn them by completing daily and weekly game challenges, referring friends, trading, and engaging with the social hub. Accumulate enough GoldCoins and redeem them to mint real gold bars — turning fun into physical gold." },
  { q: "Can I withdraw physical gold to my address?", a: "Yes. Once you hold GVT tokens or a minted gold bar in your account, you can request physical delivery. We ship 1g, 10g, 1oz, and 10oz gold bars in tamper-proof, insured packaging. Alternatively, store your gold in our vaults indefinitely at no extra cost." },
  { q: "How does GoldVaults differ from just buying Bitcoin?", a: "Bitcoin is volatile. Gold has preserved wealth for 5,000 years. GoldVaults lets you use crypto as the payment rail to acquire real gold — combining the speed and accessibility of crypto with the stability and tangibility of physical gold. It's the best of both worlds." },
  { q: "Is GoldVaults regulated?", a: "Yes. GoldVaults is registered with the SEC, FinCEN, FCA (UK), and compliant with MiCA (EU). We maintain ISO 27001 and SOC 2 Type II certifications. All vault operations are subject to quarterly independent audits." },
  { q: "How does the NFC Debit Card work?", a: "The GoldVaults Visa debit card lets you spend your gold-backed balance anywhere Visa is accepted. Tap to pay with NFC, earn 1% cashback in GoldCoins, and set spending limits directly in the app. Your gold works as real money." },
];

export function FAQSection() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="bg-slate-800/40 py-20">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-amber-400 text-sm font-semibold uppercase tracking-wider mb-2">Help Center</p>
            <h2 className="text-4xl font-black text-white">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-3">
            {FAQ_ITEMS.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className={`bg-slate-800 border rounded-xl overflow-hidden transition-all ${open === i ? "border-amber-400/30" : "border-white/8"}`}
              >
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left"
                >
                  <span className="font-semibold text-white text-sm pr-4">{item.q}</span>
                  <motion.div animate={{ rotate: open === i ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown className="w-4 h-4 text-amber-400 shrink-0" />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {open === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
                    >
                      <div className="px-5 pb-4 text-sm text-slate-400 leading-relaxed border-t border-white/5 pt-3">
                        {item.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Newsletter ──────────────────────────────────────────────────────────────
export function Newsletter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      setEmail("");
    }
  };

  return (
    <section className="bg-gradient-to-r from-amber-600/20 via-amber-500/10 to-amber-600/20 border-y border-amber-400/20 py-16">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-amber-400 text-sm font-semibold uppercase tracking-wider mb-2">Stay Informed</p>
          <h2 className="text-3xl font-black text-white mb-3">Get Gold &amp; Crypto Insights</h2>
          <p className="text-slate-400 mb-6 max-w-md mx-auto">Subscribe for daily gold price alerts, crypto-to-gold conversion tips, vault audit reports, and exclusive GoldVaults investment opportunities.</p>
          {submitted ? (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500/20 border border-emerald-400/30 rounded-xl text-emerald-400 font-semibold"
            >
              ✓ You're subscribed! Welcome to GoldVaults Insider.
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
                className="flex-1 px-4 py-3 bg-slate-800 border border-white/10 rounded-xl text-white placeholder-slate-500 outline-none focus:border-amber-400/50 transition-colors text-sm"
              />
              <button
                type="submit"
                className="flex items-center justify-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold rounded-xl transition-all active:scale-[0.97] whitespace-nowrap text-sm"
              >
                Subscribe <Send className="w-4 h-4" />
              </button>
            </form>
          )}
          <p className="text-xs text-slate-500 mt-3">No spam, unsubscribe anytime. Join 50,000+ subscribers.</p>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Footer ──────────────────────────────────────────────────────────────────
const FOOTER_LINKS: Record<string, { label: string; href: string }[]> = {
  "Gold Products": [
    { label: "Buy Gold with Crypto", href: "/buy-gold" },
    { label: "Mint Gold Bars", href: "/mint" },
    { label: "Gold ETF Wallet", href: "/gold-etf" },
    { label: "GVT Token", href: "/gvt-token" },
    { label: "Vault Storage", href: "/vault-storage" },
    { label: "Physical Delivery", href: "/physical-delivery" },
    { label: "Gold Price Alerts", href: "/gold-price-alerts" },
    { label: "Mining Partners", href: "/mining-partners" },
  ],
  "Crypto Services": [
    { label: "Bitcoin Wallet", href: "/bitcoin-wallet" },
    { label: "Crypto Exchange", href: "/exchange" },
    { label: "Live Markets", href: "/markets" },
    { label: "Trade", href: "/trade" },
    { label: "NFC Debit Card", href: "/nfc-card" },
    { label: "GoldCoins Rewards", href: "/goldcoins" },
    { label: "Game Challenges", href: "/challenges" },
    { label: "Social Hub", href: "/social" },
  ],
  Company: [
    { label: "About GoldVaults", href: "/about" },
    { label: "Vault Audits", href: "/vault-audits" },
    { label: "Security", href: "/security" },
    { label: "Blog", href: "/blog" },
    { label: "Careers", href: "/careers" },
    { label: "Referral Program", href: "/referral" },
    { label: "Contact Us", href: "/contact" },
  ],
  Learn: [
    { label: "How It Works", href: "/how-it-works" },
    { label: "Gold vs Bitcoin", href: "/gold-vs-bitcoin" },
    { label: "GVT Token Guide", href: "/gvt-token" },
    { label: "FAQ", href: "/faq" },
  ],
};

const SOCIAL_LINKS = [
  { icon: Twitter, label: "Twitter", href: "https://twitter.com/goldvaultsus" },
  { icon: Facebook, label: "Facebook", href: "https://facebook.com/goldvaultsus" },
  { icon: Instagram, label: "Instagram", href: "https://instagram.com/goldvaultsus" },
  { icon: Youtube, label: "YouTube", href: "https://youtube.com/@goldvaultsus" },
  { icon: Linkedin, label: "LinkedIn", href: "https://linkedin.com/company/goldvaultsus" },
  { icon: MessageCircle, label: "Telegram", href: "https://t.me/goldvaultsus" },
  { icon: Github, label: "GitHub", href: "https://github.com/goldvaultsus" },
];

export function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-white/8">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-6 py-16">
        {/* Top row */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-900 font-black text-sm">GV</div>
              <span className="font-black text-white text-lg">GoldVaults</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              The only platform where your crypto buys real, physical, vault-stored gold. Convert BTC, ETH, USDT and 300+ cryptocurrencies into 99.99% pure gold bars — audited, insured, and always redeemable.
            </p>
            <div className="flex flex-wrap gap-2">
              {SOCIAL_LINKS.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-8 h-8 rounded-lg bg-slate-800 border border-white/8 hover:border-amber-400/30 hover:text-amber-400 text-slate-400 flex items-center justify-center transition-all"
                >
                  <Icon className="w-3.5 h-3.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-bold text-white text-sm mb-4">{category}</h4>
              <ul className="space-y-2">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <Link href={href} className="text-xs text-slate-400 hover:text-amber-400 transition-colors">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Regulatory badges */}
        <div className="flex flex-wrap gap-3 mb-8 py-6 border-y border-white/8">
          {["SEC Registered", "FinCEN Licensed", "FCA Authorized", "MiCA Compliant", "ISO 27001", "SOC 2 Type II", "PCI DSS", "GDPR Compliant"].map(badge => (
            <span key={badge} className="px-3 py-1.5 rounded-lg bg-slate-800 border border-white/8 text-xs font-semibold text-slate-400">
              🛡️ {badge}
            </span>
          ))}
        </div>

        {/* Bottom row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>© 2024 GoldVaults.us — All rights reserved. Trading cryptocurrencies involves significant risk.</div>
          <div className="flex gap-4">
            <Link href="/privacy-policy" className="hover:text-amber-400 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-amber-400 transition-colors">Terms of Service</Link>
            <Link href="/cookie-policy" className="hover:text-amber-400 transition-colors">Cookie Policy</Link>
            <Link href="/risk-disclosure" className="hover:text-amber-400 transition-colors">Risk Disclosure</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
