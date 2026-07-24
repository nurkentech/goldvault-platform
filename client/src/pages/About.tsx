import PageLayout from "@/components/PageLayout";
import { Link } from "wouter";
import { Shield, Globe, Award, Users, TrendingUp, Zap } from "lucide-react";
import { motion } from "framer-motion";

const TEAM = [
  { name: "James Hartwell", role: "CEO & Co-Founder", bio: "Former Goldman Sachs VP with 18 years in commodities trading. Pioneered the first crypto-to-gold settlement protocol in 2019.", initials: "JH" },
  { name: "Aisha Okonkwo", role: "CTO & Co-Founder", bio: "Ex-Coinbase senior engineer. Built the blockchain settlement layer that processes $12M in gold swaps daily with sub-2-minute finality.", initials: "AO" },
  { name: "Marcus Chen", role: "Chief Vault Officer", bio: "20 years in precious metals custody. Oversees 8 vault partnerships across 4 continents holding $428M in audited gold reserves.", initials: "MC" },
  { name: "Sofia Reyes", role: "Chief Compliance Officer", bio: "Former SEC attorney. Architected GoldVaults' regulatory framework across SEC, FinCEN, FCA, and MiCA jurisdictions.", initials: "SR" },
  { name: "David Osei", role: "Head of Mining Partnerships", bio: "Negotiated vault and supply agreements with Barrick Gold, Newmont, AngloGold, and 5 other world-class mining companies.", initials: "DO" },
  { name: "Priya Nair", role: "Head of Product", bio: "Previously at Binance and Kraken. Designed the GoldCoins rewards system and the social hub that drives 40% of daily active users.", initials: "PN" },
];

const MILESTONES = [
  { year: "2019", event: "GoldVaults founded in London. First crypto-to-gold swap protocol developed." },
  { year: "2020", event: "SEC registration secured. First vault partnership signed with Barrick Gold." },
  { year: "2021", event: "Platform launch. $10M in gold tokenized in the first 30 days." },
  { year: "2022", event: "FCA authorization granted. Expanded to 50+ countries. 500K users." },
  { year: "2023", event: "MiCA compliance achieved. GVT token launched. $100M gold under custody." },
  { year: "2024", event: "5M+ users. $428M gold tokenized. 8 mining partners. NFC debit card launched." },
];

export default function About() {
  return (
    <PageLayout
      title="About GoldVaults"
      subtitle="We built GoldVaults on a simple belief: everyone deserves access to the world's most reliable store of value. We bridge the gap between crypto and physical gold."
      badge="🏛️ Our Story"
      breadcrumb="About"
    >
      {/* Mission */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h2 className="text-2xl font-black text-white mb-4">Our Mission</h2>
          <p className="text-slate-400 leading-relaxed mb-4">GoldVaults was founded in 2019 with a single mission: to make physical gold ownership as fast, accessible, and borderless as sending a cryptocurrency transaction.</p>
          <p className="text-slate-400 leading-relaxed mb-4">For thousands of years, gold has been the ultimate store of value. But buying physical gold has always been slow, expensive, and geographically restricted. We changed that.</p>
          <p className="text-slate-400 leading-relaxed">Today, anyone with a crypto wallet can convert their digital assets into real, 99.99% pure gold bars in under 2 minutes — stored in insured vaults, audited quarterly, and redeemable for physical delivery anywhere in the world.</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 gap-4">
          {[
            { icon: Users, label: "Active Investors", value: "5M+" },
            { icon: TrendingUp, label: "Gold Tokenized", value: "$428M" },
            { icon: Globe, label: "Countries Served", value: "150+" },
            { icon: Shield, label: "Insurance Fund", value: "$500M" },
            { icon: Award, label: "Mining Partners", value: "8" },
            { icon: Zap, label: "Avg Settlement", value: "< 2 min" },
          ].map((s, i) => (
            <div key={i} className="bg-slate-800 border border-white/10 rounded-xl p-4 text-center">
              <s.icon className="w-6 h-6 text-amber-400 mx-auto mb-2" />
              <div className="text-xl font-black text-white">{s.value}</div>
              <div className="text-xs text-slate-400">{s.label}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Timeline */}
      <div className="mb-16">
        <h2 className="text-2xl font-black text-white mb-8">Our Journey</h2>
        <div className="relative">
          <div className="absolute left-6 top-0 bottom-0 w-px bg-amber-400/20" />
          <div className="space-y-6">
            {MILESTONES.map((m, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="flex gap-6 pl-14 relative">
                <div className="absolute left-3 top-1.5 w-6 h-6 rounded-full bg-amber-500 border-2 border-slate-900 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-slate-900" />
                </div>
                <div className="bg-slate-800 border border-white/10 rounded-xl p-4 flex-1">
                  <span className="text-amber-400 font-black text-sm">{m.year}</span>
                  <p className="text-slate-300 text-sm mt-1">{m.event}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Team */}
      <div className="mb-16">
        <h2 className="text-2xl font-black text-white mb-2">Leadership Team</h2>
        <p className="text-slate-400 mb-8 text-sm">World-class experts from Goldman Sachs, Coinbase, Binance, the SEC, and the global precious metals industry.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {TEAM.map((member, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}
              className="bg-slate-800 border border-white/10 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400 font-black">
                  {member.initials}
                </div>
                <div>
                  <div className="font-bold text-white text-sm">{member.name}</div>
                  <div className="text-xs text-amber-400">{member.role}</div>
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{member.bio}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-amber-600/20 via-amber-500/10 to-amber-600/20 border border-amber-400/20 rounded-2xl p-10 text-center">
        <h2 className="text-2xl font-black text-white mb-3">Join 5 Million Gold Investors</h2>
        <p className="text-slate-400 mb-6">Start converting your crypto into real, physical gold today.</p>
        <Link href="/buy-gold">
          <button className="px-8 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-900 font-black rounded-xl transition-all active:scale-[0.97]">
            Buy Gold Now →
          </button>
        </Link>
      </div>
    </PageLayout>
  );
}
