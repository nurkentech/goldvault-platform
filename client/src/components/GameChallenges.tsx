import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Trophy, Target, Zap, Star, Crown, Gift, Clock, CheckCircle2,
  TrendingUp, Users, Coins, Award, Flame, Shield, Diamond,
  ChevronRight, Lock, Unlock, Medal, BarChart3
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Challenge {
  id: number;
  title: string;
  description: string;
  reward: number;
  progress: number;
  goal: number;
  unit: string;
  category: "invest" | "social" | "trade" | "defi" | "refer";
  difficulty: "easy" | "medium" | "hard" | "epic";
  timeLeft?: string;
  completed: boolean;
  icon: string;
}

interface LeaderboardEntry {
  rank: number;
  name: string;
  avatar: string;
  goldCoins: number;
  tier: string;
  change: number;
  isMe?: boolean;
}

interface Achievement {
  id: number;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  rarity: "common" | "rare" | "epic" | "legendary";
  unlockedDate?: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const DAILY_CHALLENGES: Challenge[] = [
  { id: 1, title: "Daily Investor", description: "Make any investment today", reward: 50, progress: 1, goal: 1, unit: "investment", category: "invest", difficulty: "easy", timeLeft: "14h 32m", completed: true, icon: "💰" },
  { id: 2, title: "Price Watcher", description: "Check gold prices 3 times", reward: 25, progress: 2, goal: 3, unit: "checks", category: "trade", difficulty: "easy", timeLeft: "14h 32m", completed: false, icon: "📈" },
  { id: 3, title: "Social Sharer", description: "Share your portfolio on 2 platforms", reward: 75, progress: 1, goal: 2, unit: "shares", category: "social", difficulty: "medium", timeLeft: "14h 32m", completed: false, icon: "📲" },
  { id: 4, title: "DeFi Explorer", description: "Stake any amount in DeFi yield", reward: 100, progress: 0, goal: 1, unit: "stake", category: "defi", difficulty: "medium", timeLeft: "14h 32m", completed: false, icon: "⚡" },
];

const WEEKLY_CHALLENGES: Challenge[] = [
  { id: 5, title: "Gold Accumulator", description: "Invest $500 or more in gold assets", reward: 200, progress: 350, goal: 500, unit: "$", category: "invest", difficulty: "medium", timeLeft: "3d 8h", completed: false, icon: "🥇" },
  { id: 6, title: "Community Builder", description: "Refer 2 new investors to GoldVaults", reward: 400, progress: 1, goal: 2, unit: "referrals", category: "refer", difficulty: "hard", timeLeft: "3d 8h", completed: false, icon: "👥" },
  { id: 7, title: "Trading Master", description: "Complete 10 exchange transactions", reward: 300, progress: 7, goal: 10, unit: "trades", category: "trade", difficulty: "hard", timeLeft: "3d 8h", completed: false, icon: "🔄" },
  { id: 8, title: "DeFi Yield Hunter", description: "Earn $50 in DeFi yield this week", reward: 500, progress: 32, goal: 50, unit: "$", category: "defi", difficulty: "epic", timeLeft: "3d 8h", completed: false, icon: "💎" },
];

const LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, name: "GoldKing_Elite", avatar: "GK", goldCoins: 48200, tier: "Legendary", change: 2 },
  { rank: 2, name: "VaultMaster_X", avatar: "VM", goldCoins: 41500, tier: "Legendary", change: -1 },
  { rank: 3, name: "Sofia Rossi", avatar: "SR", goldCoins: 38900, tier: "Diamond", change: 1 },
  { rank: 4, name: "CryptoGoldQueen", avatar: "CQ", goldCoins: 31200, tier: "Diamond", change: 0 },
  { rank: 5, name: "DigitalAurum", avatar: "DA", goldCoins: 28700, tier: "Platinum", change: 3 },
  { rank: 6, name: "James Wright", avatar: "JW", goldCoins: 24300, tier: "Platinum", change: -2 },
  { rank: 7, name: "GoldTrader_99", avatar: "GT", goldCoins: 19800, tier: "Gold", change: 1 },
  { rank: 8, name: "You", avatar: "ME", goldCoins: 12400, tier: "Gold", change: 5, isMe: true },
];

const ACHIEVEMENTS: Achievement[] = [
  { id: 1, name: "First Gold", description: "Made your first gold investment", icon: "🥇", unlocked: true, rarity: "common", unlockedDate: "Jan 15, 2026" },
  { id: 2, name: "Crypto Pioneer", description: "Used 5 different cryptocurrencies", icon: "🚀", unlocked: true, rarity: "common", unlockedDate: "Jan 22, 2026" },
  { id: 3, name: "Social Butterfly", description: "Shared on 3 social platforms", icon: "🦋", unlocked: true, rarity: "rare", unlockedDate: "Feb 3, 2026" },
  { id: 4, name: "DeFi Degen", description: "Earned $100 in DeFi yield", icon: "⚡", unlocked: true, rarity: "rare", unlockedDate: "Feb 18, 2026" },
  { id: 5, name: "Gold Hoarder", description: "Hold 5+ oz of gold", icon: "🏦", unlocked: false, rarity: "epic" },
  { id: 6, name: "Referral King", description: "Refer 10 investors", icon: "👑", unlocked: false, rarity: "epic" },
  { id: 7, name: "Diamond Hands", description: "Hold gold for 365 days", icon: "💎", unlocked: false, rarity: "legendary" },
  { id: 8, name: "Gold Bar Minter", description: "Mint your first gold bar", icon: "🏅", unlocked: false, rarity: "legendary" },
];

const TIERS = [
  { name: "Bronze", min: 0, max: 999, color: "from-amber-700 to-amber-800", icon: "🥉" },
  { name: "Silver", min: 1000, max: 4999, color: "from-slate-400 to-slate-500", icon: "🥈" },
  { name: "Gold", min: 5000, max: 14999, color: "from-amber-400 to-amber-500", icon: "🥇" },
  { name: "Platinum", min: 15000, max: 29999, color: "from-cyan-400 to-cyan-500", icon: "💠" },
  { name: "Diamond", min: 30000, max: 49999, color: "from-blue-400 to-purple-500", icon: "💎" },
  { name: "Legendary", min: 50000, max: Infinity, color: "from-amber-300 via-amber-500 to-amber-700", icon: "👑" },
];

const DIFFICULTY_COLORS = {
  easy: "text-green-400 bg-green-400/10 border-green-400/30",
  medium: "text-amber-400 bg-amber-400/10 border-amber-400/30",
  hard: "text-orange-400 bg-orange-400/10 border-orange-400/30",
  epic: "text-purple-400 bg-purple-400/10 border-purple-400/30",
};

const RARITY_COLORS = {
  common: "border-slate-500/50 bg-slate-800/30",
  rare: "border-blue-500/50 bg-blue-900/30",
  epic: "border-purple-500/50 bg-purple-900/30",
  legendary: "border-amber-500/50 bg-amber-900/20",
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function GameChallenges() {
  const [activeSection, setActiveSection] = useState<"challenges" | "leaderboard" | "achievements">("challenges");
  const [claimingId, setClaimingId] = useState<number | null>(null);
  const [claimedIds, setClaimedIds] = useState<number[]>([1]);
  const [userCoins] = useState(12400);

  const currentTier = TIERS.find(t => userCoins >= t.min && userCoins <= t.max) || TIERS[0];
  const nextTier = TIERS[TIERS.indexOf(currentTier) + 1];
  const tierProgress = nextTier ? ((userCoins - currentTier.min) / (nextTier.min - currentTier.min)) * 100 : 100;

  const handleClaim = (challenge: Challenge) => {
    if (claimedIds.includes(challenge.id) || !challenge.completed) return;
    setClaimingId(challenge.id);
    setTimeout(() => {
      setClaimedIds(prev => [...prev, challenge.id]);
      setClaimingId(null);
    }, 1500);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-2">Game Challenges</h2>
        <p className="text-slate-400">Complete challenges to earn GoldCoins and unlock exclusive rewards</p>
      </div>

      {/* Player Stats */}
      <div className="bg-gradient-to-r from-blue-900/60 to-slate-900/60 border border-blue-800/50 rounded-2xl p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${currentTier.color} flex items-center justify-center text-3xl shadow-lg`}>
              {currentTier.icon}
            </div>
            <div>
              <div className="text-white font-bold text-xl">Your Account</div>
              <div className={`text-sm font-semibold bg-gradient-to-r ${currentTier.color} bg-clip-text text-transparent`}>
                {currentTier.name} Tier
              </div>
              <div className="text-amber-400 font-bold text-lg">🪙 {userCoins.toLocaleString()} GoldCoins</div>
            </div>
          </div>
          <div className="flex-1 min-w-48 max-w-64">
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>{currentTier.name}</span>
              {nextTier && <span>{nextTier.name} ({(nextTier.min - userCoins).toLocaleString()} more)</span>}
            </div>
            <Progress value={tierProgress} className="h-3 bg-blue-900" />
            <div className="text-xs text-slate-500 mt-1">{tierProgress.toFixed(0)}% to {nextTier?.name || "Max"}</div>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              { label: "Rank", value: "#8", icon: "🏆" },
              { label: "Streak", value: "7d", icon: "🔥" },
              { label: "Badges", value: "4/8", icon: "🎖️" },
            ].map(stat => (
              <div key={stat.label} className="bg-blue-900/40 rounded-xl p-3">
                <div className="text-lg">{stat.icon}</div>
                <div className="text-white font-bold text-sm">{stat.value}</div>
                <div className="text-slate-400 text-xs">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="flex gap-2">
        {[
          { id: "challenges", label: "Challenges", icon: <Target className="w-4 h-4" /> },
          { id: "leaderboard", label: "Leaderboard", icon: <Trophy className="w-4 h-4" /> },
          { id: "achievements", label: "Achievements", icon: <Award className="w-4 h-4" /> },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSection(tab.id as typeof activeSection)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeSection === tab.id ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg" : "bg-blue-900/40 text-slate-300 hover:text-white hover:bg-blue-800/50"}`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* ── Challenges Section ── */}
        {activeSection === "challenges" && (
          <motion.div key="challenges" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
            {/* Daily Challenges */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-400" /> Daily Challenges
                </h3>
                <div className="flex items-center gap-1 text-slate-400 text-sm">
                  <Clock className="w-4 h-4" /> Resets in 14h 32m
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {DAILY_CHALLENGES.map((challenge, i) => (
                  <motion.div
                    key={challenge.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                  >
                    <Card className={`bg-blue-900/40 border-blue-800/50 p-4 relative overflow-hidden ${challenge.completed ? "border-green-500/30" : ""}`}>
                      {challenge.completed && (
                        <div className="absolute top-0 right-0 w-0 h-0 border-l-[40px] border-l-transparent border-t-[40px] border-t-green-500/60" />
                      )}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">{challenge.icon}</div>
                          <div>
                            <div className="text-white font-semibold text-sm">{challenge.title}</div>
                            <div className="text-slate-400 text-xs">{challenge.description}</div>
                          </div>
                        </div>
                        <Badge className={`text-xs border ${DIFFICULTY_COLORS[challenge.difficulty]}`}>
                          {challenge.difficulty}
                        </Badge>
                      </div>
                      <div className="mb-3">
                        <div className="flex justify-between text-xs text-slate-400 mb-1">
                          <span>{challenge.progress}/{challenge.goal} {challenge.unit}</span>
                          <span>{Math.round((challenge.progress / challenge.goal) * 100)}%</span>
                        </div>
                        <Progress value={(challenge.progress / challenge.goal) * 100} className="h-2 bg-blue-900" />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-amber-400 font-semibold text-sm">
                          🪙 +{challenge.reward} GoldCoins
                        </div>
                        <Button
                          size="sm"
                          disabled={!challenge.completed || claimedIds.includes(challenge.id)}
                          onClick={() => handleClaim(challenge)}
                          className={`text-xs h-7 px-3 ${claimedIds.includes(challenge.id) ? "bg-green-600/30 text-green-400 border border-green-500/30" : challenge.completed ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white" : "bg-blue-800/50 text-slate-500"}`}
                        >
                          {claimingId === challenge.id ? (
                            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.5 }}>
                              <Coins className="w-3 h-3" />
                            </motion.div>
                          ) : claimedIds.includes(challenge.id) ? (
                            <><CheckCircle2 className="w-3 h-3 mr-1" />Claimed</>
                          ) : challenge.completed ? (
                            <><Gift className="w-3 h-3 mr-1" />Claim</>
                          ) : (
                            "In Progress"
                          )}
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Weekly Challenges */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold flex items-center gap-2">
                  <Flame className="w-5 h-5 text-orange-400" /> Weekly Challenges
                </h3>
                <div className="flex items-center gap-1 text-slate-400 text-sm">
                  <Clock className="w-4 h-4" /> Resets in 3d 8h
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {WEEKLY_CHALLENGES.map((challenge, i) => (
                  <motion.div
                    key={challenge.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 + 0.3 }}
                  >
                    <Card className="bg-blue-900/40 border-blue-800/50 p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">{challenge.icon}</div>
                          <div>
                            <div className="text-white font-semibold text-sm">{challenge.title}</div>
                            <div className="text-slate-400 text-xs">{challenge.description}</div>
                          </div>
                        </div>
                        <Badge className={`text-xs border ${DIFFICULTY_COLORS[challenge.difficulty]}`}>
                          {challenge.difficulty}
                        </Badge>
                      </div>
                      <div className="mb-3">
                        <div className="flex justify-between text-xs text-slate-400 mb-1">
                          <span>{challenge.unit === "$" ? `$${challenge.progress}` : challenge.progress}/{challenge.unit === "$" ? `$${challenge.goal}` : `${challenge.goal} ${challenge.unit}`}</span>
                          <span>{Math.round((challenge.progress / challenge.goal) * 100)}%</span>
                        </div>
                        <Progress value={(challenge.progress / challenge.goal) * 100} className="h-2 bg-blue-900" />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-amber-400 font-semibold text-sm">
                          🪙 +{challenge.reward} GoldCoins
                        </div>
                        <Button size="sm" disabled className="text-xs h-7 px-3 bg-blue-800/50 text-slate-500">
                          In Progress
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Special Event */}
            <Card className="bg-gradient-to-r from-purple-900/40 to-blue-900/40 border-purple-500/30 p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="text-3xl">🌟</div>
                <div>
                  <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 mb-1">Limited Event</Badge>
                  <h3 className="text-white font-bold text-lg">Gold Rush Weekend</h3>
                  <p className="text-slate-400 text-sm">All GoldCoin rewards are 2x this weekend!</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-purple-300 text-sm">
                  <Clock className="w-4 h-4" /> Ends in 1d 16h 42m
                </div>
                <Button size="sm" className="bg-gradient-to-r from-purple-500 to-purple-600 text-white text-xs">
                  View Event <ChevronRight className="w-3 h-3 ml-1" />
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {/* ── Leaderboard Section ── */}
        {activeSection === "leaderboard" && (
          <motion.div key="leaderboard" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
            {/* Top 3 Podium */}
            <div className="flex items-end justify-center gap-4 py-6">
              {[LEADERBOARD[1], LEADERBOARD[0], LEADERBOARD[2]].map((entry, i) => {
                const heights = ["h-24", "h-32", "h-20"];
                const positions = [2, 1, 3];
                const colors = ["from-slate-400 to-slate-500", "from-amber-400 to-amber-600", "from-amber-700 to-amber-800"];
                return (
                  <motion.div
                    key={entry.rank}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex flex-col items-center gap-2"
                  >
                    <div className="text-2xl">{["🥈","🥇","🥉"][i]}</div>
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${colors[i]} flex items-center justify-center text-white text-sm font-bold shadow-lg`}>
                      {entry.avatar}
                    </div>
                    <div className="text-white text-xs font-medium text-center max-w-20 truncate">{entry.name}</div>
                    <div className="text-amber-400 text-xs">🪙 {(entry.goldCoins / 1000).toFixed(1)}k</div>
                    <div className={`${heights[i]} w-20 bg-gradient-to-t ${colors[i]} rounded-t-xl flex items-center justify-center text-white font-bold text-xl opacity-80`}>
                      #{positions[i]}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Full Leaderboard */}
            <Card className="bg-blue-900/40 border-blue-800/50 overflow-hidden">
              <div className="p-4 border-b border-blue-800/50 flex items-center justify-between">
                <h3 className="text-white font-semibold flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-amber-400" /> Global Rankings
                </h3>
                <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30">This Week</Badge>
              </div>
              <div className="divide-y divide-blue-800/30">
                {LEADERBOARD.map((entry, i) => (
                  <motion.div
                    key={entry.rank}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`flex items-center gap-4 p-4 ${entry.isMe ? "bg-amber-500/10 border-l-2 border-amber-500" : "hover:bg-blue-800/20"} transition-colors`}
                  >
                    <div className="w-8 text-center">
                      {entry.rank <= 3 ? (
                        <span className="text-lg">{["🥇","🥈","🥉"][entry.rank - 1]}</span>
                      ) : (
                        <span className="text-slate-400 font-bold">#{entry.rank}</span>
                      )}
                    </div>
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${entry.isMe ? "from-amber-500 to-amber-700" : "from-blue-600 to-blue-800"} flex items-center justify-center text-white text-xs font-bold`}>
                      {entry.avatar}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold text-sm ${entry.isMe ? "text-amber-400" : "text-white"}`}>
                          {entry.name} {entry.isMe && "(You)"}
                        </span>
                        <Badge className="text-xs px-1.5 py-0 bg-blue-800/60 text-slate-300 border-blue-700/50">{entry.tier}</Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-amber-400 font-bold text-sm">🪙 {entry.goldCoins.toLocaleString()}</div>
                      <div className={`text-xs ${entry.change > 0 ? "text-green-400" : entry.change < 0 ? "text-red-400" : "text-slate-500"}`}>
                        {entry.change > 0 ? `↑ +${entry.change}` : entry.change < 0 ? `↓ ${entry.change}` : "—"}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {/* ── Achievements Section ── */}
        {activeSection === "achievements" && (
          <motion.div key="achievements" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {ACHIEVEMENTS.map((achievement, i) => (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.07 }}
                >
                  <Card className={`p-4 text-center border ${RARITY_COLORS[achievement.rarity]} ${!achievement.unlocked ? "opacity-50 grayscale" : ""} relative overflow-hidden transition-all hover:scale-105`}>
                    {achievement.unlocked && (
                      <div className="absolute top-2 right-2">
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                      </div>
                    )}
                    {!achievement.unlocked && (
                      <div className="absolute top-2 right-2">
                        <Lock className="w-4 h-4 text-slate-500" />
                      </div>
                    )}
                    <div className="text-4xl mb-2">{achievement.icon}</div>
                    <div className="text-white font-semibold text-sm mb-1">{achievement.name}</div>
                    <div className="text-slate-400 text-xs mb-2">{achievement.description}</div>
                    <Badge className={`text-xs capitalize ${achievement.rarity === "legendary" ? "bg-amber-500/20 text-amber-300 border-amber-500/30" : achievement.rarity === "epic" ? "bg-purple-500/20 text-purple-300 border-purple-500/30" : achievement.rarity === "rare" ? "bg-blue-500/20 text-blue-300 border-blue-500/30" : "bg-slate-500/20 text-slate-300 border-slate-500/30"}`}>
                      {achievement.rarity}
                    </Badge>
                    {achievement.unlocked && achievement.unlockedDate && (
                      <div className="text-xs text-slate-500 mt-1">{achievement.unlockedDate}</div>
                    )}
                  </Card>
                </motion.div>
              ))}
            </div>
            <div className="mt-6 text-center">
              <div className="text-slate-400 text-sm">4 of 8 achievements unlocked</div>
              <Progress value={50} className="h-2 bg-blue-900 mt-2 max-w-xs mx-auto" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
