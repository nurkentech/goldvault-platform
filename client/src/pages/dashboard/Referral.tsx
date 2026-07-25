import { Copy, DollarSign, Gift, Link2, Share2, Trophy, Users } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import UserDashboardLayout from "@/components/UserDashboardLayout";
import { trpc } from "@/lib/trpc";

const tiers = [
  { level: 1, commission: "5%", requirement: "0–10 referrals" },
  { level: 2, commission: "7.5%", requirement: "11–50 referrals" },
  { level: 3, commission: "10%", requirement: "51+ referrals" },
];

export default function Referral() {
  return (
    <UserDashboardLayout>
      <ReferralContent />
    </UserDashboardLayout>
  );
}

function ReferralContent() {
  const { data, isLoading } = trpc.referral.dashboard.useQuery();
  const referralLink = data?.referralCode
    ? `${window.location.origin}/ref/${data.referralCode}`
    : "";
  const activeTier = (data?.stats.total ?? 0) >= 51 ? 3 : (data?.stats.total ?? 0) >= 11 ? 2 : 1;

  const copyLink = async () => {
    if (!referralLink) return;
    await navigator.clipboard.writeText(referralLink);
    toast.success("Referral link copied!");
  };

  if (isLoading) {
    return <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-24 bg-white/5 rounded-2xl animate-pulse" />)}</div>;
  }

  const stats = [
    { label: "Total Referrals", value: String(data?.stats.total ?? 0), icon: Users },
    { label: "Qualified Referrals", value: String(data?.stats.active ?? 0), icon: Gift },
    { label: "Total Earned", value: data?.stats.earned ?? "0", icon: DollarSign },
    { label: "Payouts", value: String(data?.commissions.length ?? 0), icon: Trophy },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Referral Program</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Invite friends and earn commission on confirmed deposits.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="bg-card/50 border border-white/5 rounded-2xl p-4">
            <stat.icon className="w-5 h-5 text-amber-400 mb-2" />
            <p className="text-lg font-bold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="bg-gradient-to-br from-amber-500/10 to-purple-500/5 border border-amber-500/20 rounded-2xl p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-3"><Link2 className="w-5 h-5 text-amber-500" /><h3 className="text-sm font-semibold">Your Referral Link</h3></div>
        <div className="flex flex-col sm:flex-row gap-2">
          <code className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs break-all">{referralLink || "Referral code unavailable"}</code>
          <button onClick={copyLink} disabled={!referralLink} className="p-3 bg-amber-500 text-black rounded-xl disabled:opacity-50"><Copy className="w-4 h-4" /></button>
          <button onClick={copyLink} disabled={!referralLink} className="flex items-center justify-center gap-2 px-4 py-2 bg-white/10 rounded-xl text-xs disabled:opacity-50"><Share2 className="w-3.5 h-3.5" /> Share</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card/50 border border-white/5 rounded-2xl p-5">
          <h3 className="text-sm font-semibold mb-4">Commission Tiers</h3>
          <div className="space-y-3">{tiers.map((tier) => <div key={tier.level} className={`flex items-center justify-between p-3 rounded-xl border ${activeTier === tier.level ? "border-amber-500/30 bg-amber-500/5" : "border-white/5"}`}><div><p className="text-xs font-semibold">Level {tier.level} · {tier.commission}</p><p className="text-[10px] text-muted-foreground">{tier.requirement}</p></div>{activeTier === tier.level && <span className="text-[10px] text-amber-400">Current</span>}</div>)}</div>
        </div>
        <div className="bg-card/50 border border-white/5 rounded-2xl p-5">
          <h3 className="text-sm font-semibold mb-4">Recent Referrals</h3>
          <div className="space-y-3">
            {data?.referrals.slice(0, 8).map((referral) => <div key={referral.id} className="flex items-center justify-between py-2 border-b border-white/5"><div><p className="text-xs font-medium">{referral.name || "GoldVaults user"}</p><p className="text-[10px] text-muted-foreground">{new Date(referral.createdAt).toLocaleDateString()}</p></div><div className="text-right"><p className="text-xs text-emerald-400">{referral.totalCommission}</p><p className="text-[10px] text-muted-foreground">{referral.status}</p></div></div>)}
            {data?.referrals.length === 0 && <p className="py-8 text-center text-xs text-muted-foreground">No referrals yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
