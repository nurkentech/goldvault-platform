/**
 * Rewards — GoldCoins, challenges, achievements, and reward redemption
 */
import UserDashboardLayout from "@/components/UserDashboardLayout";
import { trpc } from "@/lib/trpc";
import { motion } from "framer-motion";
import { Coins, Trophy, Target, Gift, Star, Zap, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const achievements = [
  { name: "First Deposit", description: "Make your first deposit", reward: "50 GC", completed: true, icon: "💰" },
  { name: "Gold Holder", description: "Hold 1 oz of gold", reward: "100 GC", completed: true, icon: "🥇" },
  { name: "Referral King", description: "Refer 10 friends", reward: "500 GC", completed: false, progress: 60, icon: "👑" },
  { name: "Diamond Hands", description: "Hold BTC for 30 days", reward: "200 GC", completed: false, progress: 80, icon: "💎" },
  { name: "Trader Pro", description: "Complete 50 trades", reward: "300 GC", completed: false, progress: 40, icon: "📈" },
  { name: "Diversified", description: "Hold 5+ different assets", reward: "150 GC", completed: true, icon: "🌐" },
];

const redeemOptions = [
  { name: "Trading Fee Discount", cost: 500, description: "50% off trading fees for 7 days", icon: Zap },
  { name: "Premium Analysis", cost: 1000, description: "AI-powered portfolio analysis report", icon: Star },
  { name: "Bonus Interest", cost: 2000, description: "+2% APY on savings for 30 days", icon: Trophy },
  { name: "Free Withdrawal", cost: 300, description: "1 free withdrawal (any network)", icon: Gift },
];

export default function Rewards() {
  return (
    <UserDashboardLayout>
      <RewardsContent />
    </UserDashboardLayout>
  );
}

function RewardsContent() {
  const { data: challenges, isLoading: challengesLoading } = trpc.challenge.list.useQuery();
  const { data: coinData, isLoading: coinsLoading } = trpc.wallet.goldCoins.useQuery();
  const goldCoins = coinData?.goldCoins ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-foreground">Rewards & Achievements</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Earn GoldCoins and unlock exclusive perks</p>
      </div>

      {/* GoldCoins Balance */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20 rounded-2xl p-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">GoldCoins Balance</p>
            <p className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Coins className="w-8 h-8 text-amber-500" />
              {coinsLoading ? <span className="inline-block h-9 w-28 animate-pulse rounded bg-white/10" /> : goldCoins.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Available reward balance</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Level 3</p>
            <div className="w-32 bg-white/10 rounded-full h-2 mt-1">
              <div className="bg-gradient-to-r from-amber-500 to-amber-400 h-2 rounded-full" style={{ width: "65%" }} />
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">{goldCoins.toLocaleString()} / 5,000 to Level 4</p>
          </div>
        </div>
      </motion.div>

      {/* Daily Challenges */}
      {challengesLoading ? (
        <div className="h-44 rounded-2xl bg-white/5 animate-pulse" />
      ) : challenges && challenges.length > 0 && (
        <div className="bg-card/50 border border-white/5 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-amber-500" />
            <h3 className="text-sm font-semibold text-foreground">Daily Challenges</h3>
          </div>
          <div className="space-y-3">
            {challenges.map((ch) => (
              <div key={ch.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${ch.isActive ? "bg-amber-500/10" : "bg-emerald-500/10"}`}>
                    {ch.isActive ? <Target className="w-4 h-4 text-amber-500" /> : <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-foreground">{ch.title}</p>
                    <p className="text-[10px] text-muted-foreground">{ch.description}</p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-amber-500">+{ch.reward} GC</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Achievements */}
      <div className="bg-card/50 border border-white/5 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-5 h-5 text-amber-500" />
          <h3 className="text-sm font-semibold text-foreground">Achievements</h3>
          <span className="text-xs text-muted-foreground ml-auto">{achievements.filter(a => a.completed).length}/{achievements.length} completed</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {achievements.map((ach, i) => (
            <motion.div
              key={ach.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`p-3 rounded-xl border ${ach.completed ? "border-emerald-500/20 bg-emerald-500/5" : "border-white/5 bg-white/[0.02]"}`}
            >
              <div className="flex items-start gap-3">
                <span className="text-xl">{ach.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-semibold text-foreground">{ach.name}</p>
                    {ach.completed && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{ach.description}</p>
                  {!ach.completed && ach.progress !== undefined && (
                    <div className="mt-2">
                      <div className="w-full bg-white/10 rounded-full h-1.5">
                        <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: `${ach.progress}%` }} />
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{ach.progress}%</p>
                    </div>
                  )}
                </div>
                <span className="text-[10px] font-semibold text-amber-500 whitespace-nowrap">{ach.reward}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Redeem */}
      <div className="bg-card/50 border border-white/5 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Gift className="w-5 h-5 text-amber-500" />
          <h3 className="text-sm font-semibold text-foreground">Redeem GoldCoins</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {redeemOptions.map((opt) => (
            <div key={opt.name} className="p-4 bg-white/5 rounded-xl border border-white/5 hover:border-amber-500/20 transition-colors">
              <opt.icon className="w-5 h-5 text-amber-500 mb-2" />
              <p className="text-xs font-semibold text-foreground">{opt.name}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{opt.description}</p>
              <button
                onClick={() => toast.success(`Redeemed "${opt.name}" for ${opt.cost} GoldCoins!`)}
                className="mt-3 px-3 py-1.5 bg-amber-500/10 text-amber-500 rounded-lg text-[10px] font-semibold hover:bg-amber-500/20 transition-colors"
              >
                {opt.cost} GC
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
