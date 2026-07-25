import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Coins, Flame, Award, ChevronRight, Info, CheckCircle2,
  TrendingUp, Shield, Star, Zap, Package, Download
} from "lucide-react";

// ─── Types & Data ─────────────────────────────────────────────────────────────
interface GoldBarTier {
  id: string;
  name: string;
  weight: string;
  coins: number;
  goldValue: string;
  description: string;
  rarity: "standard" | "premium" | "elite" | "legendary";
  features: string[];
}

const GOLD_BAR_TIERS: GoldBarTier[] = [
  {
    id: "micro",
    name: "Micro Bar",
    weight: "1g",
    coins: 500,
    goldValue: "$64",
    description: "Your first step into physical gold ownership",
    rarity: "standard",
    features: ["Digital certificate", "Blockchain verified", "Redeemable"],
  },
  {
    id: "mini",
    name: "Mini Bar",
    weight: "5g",
    coins: 2000,
    goldValue: "$320",
    description: "Perfect for regular savers building wealth",
    rarity: "premium",
    features: ["Digital certificate", "Blockchain verified", "Redeemable", "Priority shipping"],
  },
  {
    id: "standard",
    name: "Standard Bar",
    weight: "1oz",
    coins: 5000,
    goldValue: "$2,340",
    description: "The classic investment-grade gold bar",
    rarity: "elite",
    features: ["Digital certificate", "Blockchain verified", "Redeemable", "Priority shipping", "Assay card"],
  },
  {
    id: "premium",
    name: "Premium Bar",
    weight: "10oz",
    coins: 20000,
    goldValue: "$23,400",
    description: "For serious investors — maximum prestige",
    rarity: "legendary",
    features: ["Digital certificate", "Blockchain verified", "Redeemable", "Priority shipping", "Assay card", "Custom engraving"],
  },
];

const MINTED_BARS = [
  { id: 1, tier: "Micro Bar", weight: "1g", mintDate: "Feb 15, 2026", txHash: "0x4f2a...8c91", status: "Confirmed" },
  { id: 2, tier: "Mini Bar", weight: "5g", mintDate: "Mar 3, 2026", txHash: "0x7b1d...3e45", status: "Confirmed" },
];

const RARITY_STYLES = {
  standard: { border: "border-slate-500/50", bg: "from-slate-800/60 to-slate-900/60", badge: "bg-slate-500/20 text-slate-300 border-slate-500/30", glow: "" },
  premium: { border: "border-blue-500/50", bg: "from-blue-900/60 to-slate-900/60", badge: "bg-blue-500/20 text-blue-300 border-blue-500/30", glow: "shadow-blue-500/20" },
  elite: { border: "border-amber-500/50", bg: "from-amber-900/30 to-blue-900/60", badge: "bg-amber-500/20 text-amber-300 border-amber-500/30", glow: "shadow-amber-500/20" },
  legendary: { border: "border-purple-500/50", bg: "from-purple-900/40 to-blue-900/60", badge: "bg-purple-500/20 text-purple-300 border-purple-500/30", glow: "shadow-purple-500/20" },
};

// ─── Gold Bar Visual ──────────────────────────────────────────────────────────
function GoldBarVisual({ tier, animating }: { tier: GoldBarTier; animating: boolean }) {
  const isLegendary = tier.rarity === "legendary";
  const isElite = tier.rarity === "elite";

  return (
    <div className="relative flex items-center justify-center">
      {/* Glow effect */}
      <motion.div
        animate={animating ? { scale: [1, 1.4, 1], opacity: [0.3, 0.8, 0.3] } : { scale: 1, opacity: 0.2 }}
        transition={{ duration: 1.5, repeat: animating ? Infinity : 0 }}
        className={`absolute inset-0 rounded-full blur-2xl ${isLegendary ? "bg-purple-500" : isElite ? "bg-amber-500" : "bg-amber-400"}`}
      />

      {/* Gold Bar 3D shape */}
      <motion.div
        animate={animating ? { rotateY: [0, 360] } : { rotateY: 0 }}
        transition={{ duration: 2, repeat: animating ? Infinity : 0, ease: "linear" }}
        style={{ perspective: 800, transformStyle: "preserve-3d" }}
        className="relative z-10"
      >
        {/* Bar body */}
        <div className={`relative w-48 h-28 rounded-lg overflow-hidden shadow-2xl`}
          style={{
            background: isLegendary
              ? "linear-gradient(135deg, #a855f7 0%, #f59e0b 40%, #d97706 60%, #7c3aed 100%)"
              : "linear-gradient(135deg, #f59e0b 0%, #fbbf24 30%, #d97706 60%, #92400e 100%)",
            boxShadow: isLegendary
              ? "0 20px 60px rgba(168,85,247,0.4), inset 0 1px 0 rgba(255,255,255,0.3)"
              : "0 20px 60px rgba(245,158,11,0.4), inset 0 1px 0 rgba(255,255,255,0.3)",
          }}
        >
          {/* Shine overlay */}
          <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 50%, rgba(0,0,0,0.2) 100%)" }} />
          {/* Texture lines */}
          <div className="absolute inset-4 border border-amber-300/30 rounded" />
          <div className="absolute inset-6 border border-amber-300/20 rounded" />
          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-amber-900/80 font-black text-lg tracking-widest">GOLDVAULTS</div>
            <div className="text-amber-900/70 font-bold text-2xl">{tier.weight}</div>
            <div className="text-amber-900/60 text-xs tracking-wider">999.9 FINE GOLD</div>
          </div>
          {/* Corner marks */}
          <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-amber-300/40" />
          <div className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-amber-300/40" />
          <div className="absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 border-amber-300/40" />
          <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-amber-300/40" />
        </div>
        {/* Bar bottom shadow */}
        <div className="w-48 h-3 rounded-b-lg mx-auto" style={{ background: "linear-gradient(to bottom, #92400e, #451a03)", transform: "scaleX(0.95)" }} />
      </motion.div>

      {/* Floating coins animation */}
      {animating && Array.from({ length: 8 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
          animate={{
            opacity: [0, 1, 0],
            x: Math.cos((i / 8) * Math.PI * 2) * 80,
            y: Math.sin((i / 8) * Math.PI * 2) * 60 - 20,
            scale: [0, 1, 0],
          }}
          transition={{ duration: 1.5, delay: i * 0.15, repeat: Infinity, repeatDelay: 0.5 }}
          className="absolute text-lg z-20"
        >
          🪙
        </motion.div>
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function GoldMinting() {
  const [selectedTier, setSelectedTier] = useState<GoldBarTier>(GOLD_BAR_TIERS[0]);
  const [mintingState, setMintingState] = useState<"idle" | "confirming" | "minting" | "success">("idle");
  const [mintProgress, setMintProgress] = useState(0);
  const [mintedBars, setMintedBars] = useState(MINTED_BARS);
  const [userCoins] = useState(12400);

  const canAfford = userCoins >= selectedTier.coins;
  const style = RARITY_STYLES[selectedTier.rarity];

  const handleMint = () => {
    if (!canAfford) return;
    setMintingState("confirming");
  };

  const handleConfirmMint = () => {
    setMintingState("minting");
    setMintProgress(0);
    const interval = setInterval(() => {
      setMintProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setMintingState("success");
          setMintedBars(prev => [{
            id: prev.length + 1,
            tier: selectedTier.name,
            weight: selectedTier.weight,
            mintDate: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
            txHash: `0x${Math.random().toString(16).slice(2, 6)}...${Math.random().toString(16).slice(2, 6)}`,
            status: "Confirmed",
          }, ...prev]);
          return 100;
        }
        return prev + 2;
      });
    }, 60);
  };

  const handleReset = () => {
    setMintingState("idle");
    setMintProgress(0);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-2">Gold Bar Minting</h2>
        <p className="text-slate-400">Convert your GoldCoins into digital gold bars backed by real physical gold</p>
      </div>

      {/* Balance & Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Your GoldCoins", value: `🪙 ${userCoins.toLocaleString()}`, sub: "Available to mint", color: "text-amber-400" },
          { label: "Bars Minted", value: `🏅 ${mintedBars.length}`, sub: "All time", color: "text-blue-400" },
          { label: "Gold Value", value: "$384", sub: "Total minted", color: "text-green-400" },
        ].map(stat => (
          <Card key={stat.label} className="bg-blue-900/40 border-blue-800/50 p-4 text-center">
            <div className={`text-xl font-bold ${stat.color}`}>{stat.value}</div>
            <div className="text-white font-medium text-sm">{stat.label}</div>
            <div className="text-slate-500 text-xs">{stat.sub}</div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Tier Selection */}
        <div className="col-span-5 space-y-3">
          <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
            <Package className="w-5 h-5 text-amber-400" /> Select Bar Tier
          </h3>
          {GOLD_BAR_TIERS.map(tier => {
            const s = RARITY_STYLES[tier.rarity];
            const affordable = userCoins >= tier.coins;
            return (
              <motion.button
                key={tier.id}
                onClick={() => { setSelectedTier(tier); setMintingState("idle"); }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className={`w-full text-left p-4 rounded-xl border bg-gradient-to-r ${s.bg} ${s.border} ${selectedTier.id === tier.id ? `ring-2 ring-amber-500/50 shadow-lg ${s.glow}` : ""} ${!affordable ? "opacity-50" : ""} transition-all`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🏅</span>
                    <span className="text-white font-semibold text-sm">{tier.name}</span>
                    <span className="text-slate-400 text-xs">({tier.weight})</span>
                  </div>
                  <Badge className={`text-xs ${s.badge}`}>{tier.rarity}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-amber-400 text-sm font-medium">🪙 {tier.coins.toLocaleString()} coins</span>
                  <span className="text-green-400 text-sm font-medium">{tier.goldValue}</span>
                </div>
                {!affordable && (
                  <div className="text-xs text-slate-500 mt-1">Need {(tier.coins - userCoins).toLocaleString()} more coins</div>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Minting Panel */}
        <div className="col-span-7">
          <Card className={`bg-gradient-to-br ${style.bg} border ${style.border} p-6 h-full flex flex-col`}>
            {/* Bar Visual */}
            <div className="flex-1 flex items-center justify-center py-6">
              <GoldBarVisual tier={selectedTier} animating={mintingState === "minting"} />
            </div>

            {/* Bar Info */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="text-white font-bold text-xl">{selectedTier.name}</h3>
                  <p className="text-slate-400 text-sm">{selectedTier.description}</p>
                </div>
                <Badge className={`text-sm ${style.badge}`}>{selectedTier.rarity}</Badge>
              </div>

              {/* Features */}
              <div className="grid grid-cols-2 gap-1 mb-4">
                {selectedTier.features.map(f => (
                  <div key={f} className="flex items-center gap-1 text-xs text-slate-300">
                    <CheckCircle2 className="w-3 h-3 text-green-400 flex-shrink-0" />
                    {f}
                  </div>
                ))}
              </div>

              {/* Cost Summary */}
              <div className="bg-blue-900/40 rounded-xl p-3 mb-4 flex items-center justify-between">
                <div>
                  <div className="text-slate-400 text-xs">Cost</div>
                  <div className="text-amber-400 font-bold">🪙 {selectedTier.coins.toLocaleString()} GoldCoins</div>
                </div>
                <div className="text-center">
                  <ChevronRight className="w-5 h-5 text-slate-500" />
                </div>
                <div className="text-right">
                  <div className="text-slate-400 text-xs">Gold Value</div>
                  <div className="text-green-400 font-bold">{selectedTier.goldValue}</div>
                </div>
              </div>

              {/* Minting States */}
              <AnimatePresence mode="wait">
                {mintingState === "idle" && (
                  <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <Button
                      onClick={handleMint}
                      disabled={!canAfford}
                      className={`w-full h-12 text-base font-semibold ${canAfford ? "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-lg" : "bg-blue-900/50 text-slate-500"}`}
                    >
                      {canAfford ? (
                        <><Flame className="w-5 h-5 mr-2" />Mint {selectedTier.name}</>
                      ) : (
                        <>Not enough GoldCoins ({(selectedTier.coins - userCoins).toLocaleString()} more needed)</>
                      )}
                    </Button>
                  </motion.div>
                )}

                {mintingState === "confirming" && (
                  <motion.div key="confirming" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-sm text-amber-300">
                      <div className="flex items-start gap-2">
                        <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="font-semibold mb-1">Confirm Minting</div>
                          <div>You will spend <strong>🪙 {selectedTier.coins.toLocaleString()} GoldCoins</strong> to mint a <strong>{selectedTier.name} ({selectedTier.weight})</strong> worth <strong>{selectedTier.goldValue}</strong>. This action cannot be undone.</div>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Button variant="outline" className="flex-1 border-blue-700 text-slate-300" onClick={handleReset}>Cancel</Button>
                      <Button onClick={handleConfirmMint} className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 text-white">
                        <Flame className="w-4 h-4 mr-2" /> Confirm & Mint
                      </Button>
                    </div>
                  </motion.div>
                )}

                {mintingState === "minting" && (
                  <motion.div key="minting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                    <div className="text-center text-white font-semibold">Minting your gold bar...</div>
                    <Progress value={mintProgress} className="h-3 bg-blue-900" />
                    <div className="text-center text-slate-400 text-sm">{mintProgress < 30 ? "Verifying GoldCoins balance..." : mintProgress < 60 ? "Recording on blockchain..." : mintProgress < 90 ? "Generating digital certificate..." : "Finalizing..."}</div>
                  </motion.div>
                )}

                {mintingState === "success" && (
                  <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                    <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-center">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className="text-4xl mb-2"
                      >
                        🎉
                      </motion.div>
                      <div className="text-green-400 font-bold text-lg">Gold Bar Minted!</div>
                      <div className="text-slate-300 text-sm">Your {selectedTier.name} has been successfully minted and recorded on the blockchain.</div>
                    </div>
                    <div className="flex gap-3">
                      <Button variant="outline" className="flex-1 border-blue-700 text-slate-300 text-xs" onClick={handleReset}>
                        <Download className="w-3 h-3 mr-1" /> View Certificate
                      </Button>
                      <Button onClick={handleReset} className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs">
                        Mint Another
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Card>
        </div>
      </div>

      {/* Minting History */}
      <Card className="bg-blue-900/40 border-blue-800/50 overflow-hidden">
        <div className="p-4 border-b border-blue-800/50">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" /> Your Minted Bars
          </h3>
        </div>
        {mintedBars.length === 0 ? (
          <div className="p-8 text-center text-slate-400">No bars minted yet. Mint your first gold bar above!</div>
        ) : (
          <div className="divide-y divide-blue-800/30">
            {mintedBars.map((bar, i) => (
              <motion.div
                key={bar.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-4 p-4 hover:bg-blue-800/20 transition-colors"
              >
                <div className="text-2xl">🏅</div>
                <div className="flex-1">
                  <div className="text-white font-semibold text-sm">{bar.tier} ({bar.weight})</div>
                  <div className="text-slate-400 text-xs">Minted {bar.mintDate} • {bar.txHash}</div>
                </div>
                <Badge className="bg-green-500/20 text-green-300 border-green-500/30 text-xs">
                  <CheckCircle2 className="w-3 h-3 mr-1" />{bar.status}
                </Badge>
              </motion.div>
            ))}
          </div>
        )}
      </Card>

      {/* How It Works */}
      <Card className="bg-blue-900/30 border-blue-800/50 p-6">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Info className="w-5 h-5 text-amber-400" /> How Gold Bar Minting Works
        </h3>
        <div className="grid grid-cols-4 gap-4">
          {[
            { step: "1", icon: "🪙", title: "Earn GoldCoins", desc: "Complete challenges, invest, refer friends" },
            { step: "2", icon: "🎯", title: "Choose a Tier", desc: "Select the gold bar size that fits your coins" },
            { step: "3", icon: "⛏️", title: "Mint Your Bar", desc: "Confirm and record on the blockchain" },
            { step: "4", icon: "🏦", title: "Redeem Anytime", desc: "Convert to physical gold or sell digitally" },
          ].map(item => (
            <div key={item.step} className="text-center">
              <div className="text-3xl mb-2">{item.icon}</div>
              <div className="text-amber-400 text-xs font-bold mb-1">STEP {item.step}</div>
              <div className="text-white text-sm font-semibold mb-1">{item.title}</div>
              <div className="text-slate-400 text-xs">{item.desc}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
