import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, MapPin, Pickaxe, Globe, Shield, BarChart3, Zap } from "lucide-react";

const partners = [
  {
    id: 1,
    name: "Barrick Gold Corporation",
    ticker: "GOLD",
    country: "Canada",
    flag: "🇨🇦",
    logo: "🏆",
    status: "Active",
    tier: "Platinum",
    annualProduction: "4.1M oz",
    reserves: "76M oz",
    mines: 16,
    regions: ["Nevada", "Dominican Republic", "Tanzania", "Papua New Guinea", "Argentina"],
    integration: ["Live Production Feed", "Reserve Data API", "ESG Reports", "Price Hedging"],
    yieldShare: "0.15%",
    description: "World's second-largest gold mining company. GoldVault users earn yield from Barrick's production royalties.",
    price: 18.42,
    change: +2.3,
    marketCap: "$31.2B",
    esgScore: 87,
    color: "from-yellow-600 to-amber-700"
  },
  {
    id: 2,
    name: "Newmont Corporation",
    ticker: "NEM",
    country: "USA",
    flag: "🇺🇸",
    logo: "⛏️",
    status: "Active",
    tier: "Platinum",
    annualProduction: "6.9M oz",
    reserves: "96M oz",
    mines: 17,
    regions: ["Nevada", "Ghana", "Peru", "Australia", "Suriname"],
    integration: ["Live Production Feed", "Royalty Stream", "Carbon Credits", "ESG Reports"],
    yieldShare: "0.18%",
    description: "World's largest gold mining company. Provides real-time production data and royalty streams to GoldVault.",
    price: 42.15,
    change: +1.8,
    marketCap: "$52.4B",
    esgScore: 91,
    color: "from-blue-600 to-blue-800"
  },
  {
    id: 3,
    name: "AngloGold Ashanti",
    ticker: "AU",
    country: "South Africa",
    flag: "🇿🇦",
    logo: "💎",
    status: "Active",
    tier: "Gold",
    annualProduction: "2.6M oz",
    reserves: "30M oz",
    mines: 12,
    regions: ["Ghana", "Guinea", "Tanzania", "Brazil", "Australia"],
    integration: ["Production API", "Royalty Stream", "ESG Reports"],
    yieldShare: "0.12%",
    description: "Leading African gold producer with operations across 4 continents. Provides tokenized royalty streams.",
    price: 26.80,
    change: -0.5,
    marketCap: "$11.8B",
    esgScore: 79,
    color: "from-orange-600 to-red-700"
  },
  {
    id: 4,
    name: "Kinross Gold",
    ticker: "KGC",
    country: "Canada",
    flag: "🇨🇦",
    logo: "🌟",
    status: "Active",
    tier: "Gold",
    annualProduction: "2.1M oz",
    reserves: "30M oz",
    mines: 9,
    regions: ["USA", "Brazil", "Chile", "Mauritania", "Ghana"],
    integration: ["Production Feed", "Royalty API", "ESG Data"],
    yieldShare: "0.10%",
    description: "Senior gold mining company with a diversified portfolio across Americas and Africa.",
    price: 8.92,
    change: +3.1,
    marketCap: "$11.3B",
    esgScore: 82,
    color: "from-green-600 to-teal-700"
  },
  {
    id: 5,
    name: "Agnico Eagle Mines",
    ticker: "AEM",
    country: "Canada",
    flag: "🇨🇦",
    logo: "🦅",
    status: "Active",
    tier: "Gold",
    annualProduction: "3.4M oz",
    reserves: "54M oz",
    mines: 11,
    regions: ["Canada", "Finland", "Mexico", "Australia"],
    integration: ["Live Production Feed", "Royalty Stream", "ESG Reports"],
    yieldShare: "0.14%",
    description: "Premium gold miner with industry-leading ESG performance and low-cost operations.",
    price: 88.45,
    change: +0.9,
    marketCap: "$43.2B",
    esgScore: 94,
    color: "from-purple-600 to-indigo-700"
  },
  {
    id: 6,
    name: "Gold Fields Limited",
    ticker: "GFI",
    country: "South Africa",
    flag: "🇿🇦",
    logo: "🏅",
    status: "Active",
    tier: "Silver",
    annualProduction: "2.3M oz",
    reserves: "50M oz",
    mines: 9,
    regions: ["South Africa", "Ghana", "Peru", "Australia", "Chile"],
    integration: ["Production API", "ESG Reports"],
    yieldShare: "0.09%",
    description: "Diversified global gold producer with operations across 4 continents.",
    price: 17.30,
    change: +1.4,
    marketCap: "$13.4B",
    esgScore: 76,
    color: "from-amber-500 to-yellow-600"
  },
  {
    id: 7,
    name: "Harmony Gold Mining",
    ticker: "HMY",
    country: "South Africa",
    flag: "🇿🇦",
    logo: "⚡",
    status: "Pending",
    tier: "Silver",
    annualProduction: "1.5M oz",
    reserves: "40M oz",
    mines: 13,
    regions: ["South Africa", "Papua New Guinea"],
    integration: ["Production API"],
    yieldShare: "0.07%",
    description: "South Africa's largest gold producer by volume, expanding into Papua New Guinea.",
    price: 6.85,
    change: -1.2,
    marketCap: "$4.1B",
    esgScore: 71,
    color: "from-slate-600 to-slate-700"
  },
  {
    id: 8,
    name: "Endeavour Mining",
    ticker: "EDV",
    country: "UK",
    flag: "🇬🇧",
    logo: "🌍",
    status: "Active",
    tier: "Silver",
    annualProduction: "1.4M oz",
    reserves: "20M oz",
    mines: 8,
    regions: ["Côte d'Ivoire", "Burkina Faso", "Senegal", "Mali"],
    integration: ["Production Feed", "ESG Data"],
    yieldShare: "0.08%",
    description: "West Africa's leading gold producer with a strong growth pipeline.",
    price: 21.60,
    change: +2.7,
    marketCap: "$5.8B",
    esgScore: 78,
    color: "from-rose-600 to-pink-700"
  }
];

const integrationStats = [
  { label: "Partner Mines", value: "95+", icon: <Pickaxe className="w-5 h-5" /> },
  { label: "Annual Production", value: "24.3M oz", icon: <BarChart3 className="w-5 h-5" /> },
  { label: "Combined Reserves", value: "396M oz", icon: <Shield className="w-5 h-5" /> },
  { label: "Countries", value: "32+", icon: <Globe className="w-5 h-5" /> },
  { label: "Avg Yield Share", value: "0.12%", icon: <TrendingUp className="w-5 h-5" /> },
  { label: "Real-time Feeds", value: "Live", icon: <Zap className="w-5 h-5" /> },
];

const tierColors: Record<string, string> = {
  Platinum: "bg-slate-300 text-slate-900",
  Gold: "bg-amber-400 text-amber-900",
  Silver: "bg-slate-400 text-slate-900",
};

export default function GoldMiningPartners() {
  const [selectedTier, setSelectedTier] = useState("All");
  const [selectedPartner, setSelectedPartner] = useState<typeof partners[0] | null>(null);

  const tiers = ["All", "Platinum", "Gold", "Silver"];
  const filtered = selectedTier === "All" ? partners : partners.filter(p => p.tier === selectedTier);

  return (
    <div className="space-y-12 py-16">
      {/* Header */}
      <section className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm font-medium mb-4">
          <Pickaxe className="w-4 h-4" />
          Strategic Mining Partnerships
        </div>
        <h2 className="text-4xl font-bold text-white">Gold Mining Partner Network</h2>
        <p className="text-xl text-slate-300 max-w-3xl mx-auto">
          GoldVault is directly integrated with the world's largest gold mining companies. Your investments are backed by real, audited gold production data and royalty streams from our global partner network.
        </p>
      </section>

      {/* Integration Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {integrationStats.map((stat, i) => (
          <Card key={i} className="p-4 bg-blue-900/30 border-blue-800/50 text-center hover:bg-blue-900/50 transition">
            <div className="flex justify-center mb-2 text-amber-400">{stat.icon}</div>
            <p className="text-2xl font-bold text-amber-400">{stat.value}</p>
            <p className="text-xs text-slate-400 mt-1">{stat.label}</p>
          </Card>
        ))}
      </div>

      {/* How Integration Works */}
      <Card className="p-8 bg-gradient-to-r from-blue-900/40 to-amber-900/20 border-amber-500/20">
        <h3 className="text-2xl font-bold text-white mb-6 text-center">How Mining Partner Integration Works</h3>
        <div className="grid md:grid-cols-4 gap-6">
          {[
            { step: "01", title: "Real-Time Production Data", desc: "Partners stream live gold production data via secure APIs. Every ounce mined is recorded on-chain.", icon: "⛏️" },
            { step: "02", title: "Royalty Tokenization", desc: "Production royalties are tokenized as smart contracts, distributing yield proportionally to GoldVault holders.", icon: "🔗" },
            { step: "03", title: "Yield Distribution", desc: "0.07–0.18% annual yield is automatically distributed to your gold holdings every 24 hours.", icon: "💰" },
            { step: "04", title: "ESG Verification", desc: "All partners undergo quarterly ESG audits. Only ethically sourced, conflict-free gold enters the GoldVault ecosystem.", icon: "✅" },
          ].map((item, i) => (
            <div key={i} className="text-center space-y-3">
              <div className="text-4xl">{item.icon}</div>
              <div className="text-amber-400 font-mono text-sm font-bold">{item.step}</div>
              <h4 className="text-white font-semibold">{item.title}</h4>
              <p className="text-slate-400 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Tier Filter */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-slate-400 text-sm font-medium">Filter by tier:</span>
        {tiers.map(tier => (
          <button
            key={tier}
            onClick={() => setSelectedTier(tier)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
              selectedTier === tier
                ? "bg-amber-500 text-white"
                : "bg-blue-900/40 text-slate-300 hover:bg-blue-900/60 border border-blue-800/50"
            }`}
          >
            {tier}
          </button>
        ))}
        <span className="ml-auto text-slate-400 text-sm">{filtered.length} partners</span>
      </div>

      {/* Partner Cards Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filtered.map(partner => (
          <Card
            key={partner.id}
            onClick={() => setSelectedPartner(partner)}
            className="p-5 bg-blue-900/30 border-blue-800/50 hover:border-amber-500/50 hover:bg-blue-900/50 transition cursor-pointer group"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${partner.color} flex items-center justify-center text-2xl`}>
                  {partner.logo}
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm leading-tight">{partner.name}</h4>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-slate-400 text-xs">{partner.flag} {partner.ticker}</span>
                  </div>
                </div>
              </div>
              <Badge className={`text-xs ${tierColors[partner.tier]}`}>{partner.tier}</Badge>
            </div>

            {/* Price */}
            <div className="flex items-center justify-between mb-4 p-3 bg-blue-950/50 rounded-lg">
              <span className="text-white font-bold">${partner.price}</span>
              <span className={`text-sm font-semibold flex items-center gap-1 ${partner.change >= 0 ? "text-green-400" : "text-red-400"}`}>
                {partner.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {partner.change >= 0 ? "+" : ""}{partner.change}%
              </span>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
              <div>
                <p className="text-slate-500">Production</p>
                <p className="text-amber-400 font-semibold">{partner.annualProduction}/yr</p>
              </div>
              <div>
                <p className="text-slate-500">Reserves</p>
                <p className="text-amber-400 font-semibold">{partner.reserves}</p>
              </div>
              <div>
                <p className="text-slate-500">Yield Share</p>
                <p className="text-green-400 font-semibold">{partner.yieldShare} APY</p>
              </div>
              <div>
                <p className="text-slate-500">ESG Score</p>
                <p className="text-blue-400 font-semibold">{partner.esgScore}/100</p>
              </div>
            </div>

            {/* Regions */}
            <div className="flex items-center gap-1 mb-3">
              <MapPin className="w-3 h-3 text-slate-500" />
              <p className="text-slate-400 text-xs truncate">{partner.regions.slice(0, 3).join(", ")}{partner.regions.length > 3 ? "..." : ""}</p>
            </div>

            {/* Integration Tags */}
            <div className="flex flex-wrap gap-1">
              {partner.integration.slice(0, 2).map((tag, i) => (
                <span key={i} className="text-xs px-2 py-0.5 bg-amber-500/10 text-amber-400 rounded-full border border-amber-500/20">
                  {tag}
                </span>
              ))}
              {partner.integration.length > 2 && (
                <span className="text-xs px-2 py-0.5 bg-slate-800 text-slate-400 rounded-full">
                  +{partner.integration.length - 2} more
                </span>
              )}
            </div>

            {/* Status */}
            <div className="mt-3 flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${partner.status === "Active" ? "bg-green-400 animate-pulse" : "bg-yellow-400"}`} />
              <span className={`text-xs ${partner.status === "Active" ? "text-green-400" : "text-yellow-400"}`}>
                {partner.status}
              </span>
            </div>
          </Card>
        ))}
      </div>

      {/* Partner Detail Modal */}
      {selectedPartner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={() => setSelectedPartner(null)}>
          <Card className="max-w-2xl w-full p-8 bg-blue-950 border-amber-500/30 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${selectedPartner.color} flex items-center justify-center text-3xl`}>
                  {selectedPartner.logo}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">{selectedPartner.name}</h3>
                  <p className="text-slate-400">{selectedPartner.flag} {selectedPartner.ticker} · {selectedPartner.marketCap} Market Cap</p>
                </div>
              </div>
              <button onClick={() => setSelectedPartner(null)} className="text-slate-400 hover:text-white text-2xl">×</button>
            </div>

            <p className="text-slate-300 mb-6">{selectedPartner.description}</p>

            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                { label: "Annual Production", value: selectedPartner.annualProduction },
                { label: "Gold Reserves", value: selectedPartner.reserves },
                { label: "Active Mines", value: selectedPartner.mines },
                { label: "Yield Share APY", value: selectedPartner.yieldShare },
                { label: "ESG Score", value: `${selectedPartner.esgScore}/100` },
                { label: "Status", value: selectedPartner.status },
              ].map((item, i) => (
                <div key={i} className="p-3 bg-blue-900/40 rounded-lg text-center">
                  <p className="text-amber-400 font-bold">{item.value}</p>
                  <p className="text-slate-500 text-xs mt-1">{item.label}</p>
                </div>
              ))}
            </div>

            <div className="mb-6">
              <h4 className="text-white font-semibold mb-3">Operating Regions</h4>
              <div className="flex flex-wrap gap-2">
                {selectedPartner.regions.map((r, i) => (
                  <span key={i} className="px-3 py-1 bg-blue-900/50 text-slate-300 rounded-full text-sm border border-blue-800/50">{r}</span>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h4 className="text-white font-semibold mb-3">API Integrations</h4>
              <div className="flex flex-wrap gap-2">
                {selectedPartner.integration.map((tag, i) => (
                  <span key={i} className="px-3 py-1 bg-amber-500/10 text-amber-400 rounded-full text-sm border border-amber-500/20">{tag}</span>
                ))}
              </div>
            </div>

            <button className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold rounded-lg transition">
              Invest via {selectedPartner.name} Royalties
            </button>
          </Card>
        </div>
      )}

      {/* Become a Partner CTA */}
      <Card className="p-8 bg-gradient-to-r from-amber-500/10 to-amber-600/10 border border-amber-500/30 text-center space-y-4">
        <h3 className="text-2xl font-bold text-white">Are You a Gold Mining Company?</h3>
        <p className="text-slate-300 max-w-2xl mx-auto">
          Join the GoldVault partner network and tokenize your production royalties. Reach 500,000+ crypto-native investors and unlock new capital streams through our DeFi integration.
        </p>
        <div className="flex gap-4 justify-center">
          <button className="px-8 py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg transition">
            Apply for Partnership
          </button>
          <button className="px-8 py-3 border border-amber-500/50 text-amber-400 hover:bg-amber-500/10 font-semibold rounded-lg transition">
            Download Partnership Kit
          </button>
        </div>
      </Card>
    </div>
  );
}
