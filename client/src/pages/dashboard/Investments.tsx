/**
 * Investments — Browse plans, invest wallet balance, track ROI
 */
import { useState, useMemo } from "react";
import UserDashboardLayout from "@/components/UserDashboardLayout";
import { motion, AnimatePresence } from "framer-motion";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  TrendingUp, Clock, DollarSign, Target, Plus, CheckCircle2,
  AlertCircle, Wallet, ArrowRight, Shield, Zap, Gem, BarChart3,
  Calendar, Percent, X, Loader2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const AVAILABLE_PLANS = [
  { id: "gold-savings", name: "Gold Savings Plan", roi: "10", roiRange: "8-12%", duration: 180, durationLabel: "6 months", minInvest: 250, risk: "Low", type: "Gold", icon: <Shield className="w-5 h-5" />, color: "text-amber-400", bg: "bg-amber-500/10", desc: "Steady returns backed by physical gold reserves. Low risk with consistent monthly payouts." },
  { id: "crypto-index", name: "Crypto Index Fund", roi: "18", roiRange: "15-25%", duration: 365, durationLabel: "12 months", minInvest: 500, risk: "Medium", type: "Crypto", icon: <BarChart3 className="w-5 h-5" />, color: "text-blue-400", bg: "bg-blue-500/10", desc: "Diversified crypto portfolio tracking top 20 coins by market cap." },
  { id: "btc-mining", name: "BTC Mining Pool", roi: "9", roiRange: "8-12%", duration: 90, durationLabel: "3 months", minInvest: 1000, risk: "Low", type: "Mining", icon: <Zap className="w-5 h-5" />, color: "text-orange-400", bg: "bg-orange-500/10", desc: "Hash power allocation in enterprise-grade mining facilities." },
  { id: "defi-yield", name: "DeFi Liquidity Pool", roi: "28", roiRange: "20-35%", duration: 180, durationLabel: "6 months", minInvest: 200, risk: "High", type: "DeFi", icon: <Gem className="w-5 h-5" />, color: "text-purple-400", bg: "bg-purple-500/10", desc: "Automated yield farming across top DeFi protocols." },
  { id: "gold-bonds", name: "Gold-Backed Bonds", roi: "7", roiRange: "6-8%", duration: 730, durationLabel: "24 months", minInvest: 5000, risk: "Very Low", type: "Bonds", icon: <Shield className="w-5 h-5" />, color: "text-green-400", bg: "bg-green-500/10", desc: "Long-term bonds secured by allocated gold bullion in Swiss vaults." },
  { id: "eth-staking", name: "ETH Staking", roi: "5", roiRange: "4-6%", duration: 365, durationLabel: "12 months", minInvest: 500, risk: "Low", type: "Staking", icon: <Target className="w-5 h-5" />, color: "text-cyan-400", bg: "bg-cyan-500/10", desc: "Ethereum proof-of-stake validator rewards with no lock-up penalty." },
];

export default function Investments() {
  return (
    <UserDashboardLayout>
      <InvestmentsContent />
    </UserDashboardLayout>
  );
}

function InvestmentsContent() {
  const [tab, setTab] = useState<"active" | "plans">("active");
  const [investDialog, setInvestDialog] = useState<typeof AVAILABLE_PLANS[0] | null>(null);
  const [investAmount, setInvestAmount] = useState("");
  const [agreement, setAgreement] = useState<{ id: number; terms: string } | null>(null);
  const [signatureName, setSignatureName] = useState("");

  const investmentsQuery = trpc.investment.list.useQuery();
  const walletsQuery = trpc.wallet.list.useQuery();
  const utils = trpc.useUtils();

  const createInvestment = trpc.investment.create.useMutation({
    onSuccess: () => {
      utils.investment.list.invalidate();
      utils.wallet.list.invalidate();
      setInvestDialog(null);
      setInvestAmount("");
      setAgreement(null);
      setSignatureName("");
      toast.success("Investment activated!", { description: "Your funds have been allocated to the plan." });
    },
    onError: (e) => toast.error("Investment failed", { description: e.message }),
  });
  const createAgreement = trpc.advanced.agreements.create.useMutation({
    onSuccess: (data) => { if (data.required && data.agreementId && data.terms) setAgreement({ id: data.agreementId, terms: data.terms }); },
  });
  const signAgreement = trpc.advanced.agreements.sign.useMutation({
    onSuccess: () => { if (agreement) submitInvestment(agreement.id); },
    onError: (error) => toast.error(error.message),
  });

  const investments = investmentsQuery.data ?? [];
  const usdWallet = walletsQuery.data?.find(w => w.currency === "USD");
  const walletBalance = parseFloat(usdWallet?.balance ?? "0");

  const totalInvested = useMemo(() => investments.reduce((sum, inv) => sum + parseFloat(inv.amount), 0), [investments]);
  const totalProfit = useMemo(() => investments.reduce((sum, inv) => sum + parseFloat(inv.earnedProfit), 0), [investments]);
  const activeCount = investments.filter(inv => inv.status === "active").length;

  function getProgress(inv: typeof investments[0]) {
    const start = new Date(inv.startDate).getTime();
    const end = new Date(inv.endDate).getTime();
    const now = Date.now();
    if (now >= end) return 100;
    return Math.min(100, Math.max(0, Math.round(((now - start) / (end - start)) * 100)));
  }

  function submitInvestment(agreementId?: number) {
    if (!investDialog) return;
    const amount = parseFloat(investAmount);
    if (isNaN(amount) || amount < investDialog.minInvest) {
      toast.error(`Minimum investment is $${investDialog.minInvest.toLocaleString()}`);
      return;
    }
    if (amount > walletBalance) {
      toast.error("Insufficient balance", { description: "Please deposit funds to your wallet first." });
      return;
    }
    createInvestment.mutate({
      planId: investDialog.id,
      planName: investDialog.name,
      amount: amount.toString(),
      currency: "USD",
      expectedRoi: investDialog.roi,
      duration: investDialog.duration,
      agreementId,
    });
  }

  function handleInvest() {
    if (!investDialog) return;
    const amount = Number(investAmount);
    if (amount > 10_000 && !agreement) {
      createAgreement.mutate({ planId: investDialog.id, amount: investAmount, currency: "USD" });
      return;
    }
    submitInvestment();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Investments</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Manage your investment portfolio and explore new plans</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Wallet className="w-4 h-4" />
          <span>Balance: <span className="text-foreground font-semibold">${walletBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 bg-card border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Invested</p>
              <p className="text-lg font-bold text-foreground">${totalInvested.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-card border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Profit</p>
              <p className="text-lg font-bold text-green-400">${totalProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-card border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Target className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Active Plans</p>
              <p className="text-lg font-bold text-foreground">{activeCount}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-muted/50 rounded-xl w-fit">
        <button onClick={() => setTab("active")} className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${tab === "active" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
          Active Investments ({activeCount})
        </button>
        <button onClick={() => setTab("plans")} className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${tab === "plans" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
          Available Plans ({AVAILABLE_PLANS.length})
        </button>
      </div>

      {/* Active Investments */}
      {tab === "active" && (
        <div className="space-y-4">
          {investmentsQuery.isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : investments.length === 0 ? (
            <Card className="p-8 text-center bg-card border-border">
              <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No active investments</h3>
              <p className="text-muted-foreground text-sm mb-4">Browse available plans and start growing your portfolio.</p>
              <button onClick={() => setTab("plans")} className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-medium rounded-xl text-sm transition hover:opacity-90">
                <Plus className="w-4 h-4" /> Explore Plans
              </button>
            </Card>
          ) : (
            investments.map((inv, i) => {
              const progress = getProgress(inv);
              const expectedProfit = parseFloat(inv.amount) * parseFloat(inv.expectedRoi) / 100;
              return (
                <motion.div key={inv.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card className="p-5 bg-card border-border hover:border-primary/30 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-foreground truncate">{inv.planName}</h3>
                          <Badge variant={inv.status === "active" ? "default" : inv.status === "completed" ? "secondary" : "destructive"} className="text-xs">
                            {inv.status === "active" ? "Active" : inv.status === "completed" ? "Completed" : "Cancelled"}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" /> ${parseFloat(inv.amount).toLocaleString()}</span>
                          <span className="flex items-center gap-1"><Percent className="w-3 h-3" /> {inv.expectedRoi}% ROI</span>
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {inv.duration} days</span>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Ends {new Date(inv.endDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs text-muted-foreground">Expected Profit</p>
                        <p className="text-lg font-bold text-green-400">+${expectedProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                        <span>Progress</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })
          )}
        </div>
      )}

      {/* Available Plans */}
      {tab === "plans" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {AVAILABLE_PLANS.map((plan, i) => (
            <motion.div key={plan.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="p-5 bg-card border-border hover:border-primary/30 transition-colors h-full flex flex-col">
                <div className="flex items-start gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-xl ${plan.bg} flex items-center justify-center ${plan.color} shrink-0`}>
                    {plan.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground">{plan.name}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{plan.desc}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-4 mt-auto">
                  <div className="p-2 bg-muted/50 rounded-lg text-center">
                    <p className="text-xs text-muted-foreground">ROI</p>
                    <p className="text-sm font-bold text-green-400">{plan.roiRange}</p>
                  </div>
                  <div className="p-2 bg-muted/50 rounded-lg text-center">
                    <p className="text-xs text-muted-foreground">Duration</p>
                    <p className="text-sm font-bold text-foreground">{plan.durationLabel}</p>
                  </div>
                  <div className="p-2 bg-muted/50 rounded-lg text-center">
                    <p className="text-xs text-muted-foreground">Min. Invest</p>
                    <p className="text-sm font-bold text-foreground">${plan.minInvest.toLocaleString()}</p>
                  </div>
                  <div className="p-2 bg-muted/50 rounded-lg text-center">
                    <p className="text-xs text-muted-foreground">Risk</p>
                    <p className={`text-sm font-bold ${plan.risk === "Very Low" || plan.risk === "Low" ? "text-green-400" : plan.risk === "Medium" ? "text-amber-400" : "text-red-400"}`}>{plan.risk}</p>
                  </div>
                </div>
                <button
                  onClick={() => { setInvestDialog(plan); setInvestAmount(plan.minInvest.toString()); }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground font-medium rounded-xl text-sm transition hover:opacity-90 active:scale-[0.97]"
                >
                  <Plus className="w-4 h-4" /> Invest Now
                </button>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Invest Dialog */}
      <AnimatePresence>
        {investDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setInvestDialog(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
              className="w-full max-w-md max-h-[calc(100vh-2rem)] overflow-y-auto bg-card border border-border rounded-2xl p-4 sm:p-6 shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-foreground">Invest in {investDialog.name}</h3>
                <button onClick={() => setInvestDialog(null)} className="text-muted-foreground hover:text-foreground transition">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {agreement && <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 space-y-3">
                  <h4 className="text-sm font-semibold text-amber-400">Premium investment agreement</h4>
                  <p className="max-h-28 overflow-y-auto text-xs text-muted-foreground">{agreement.terms}</p>
                  <input aria-label="Legal signature name" value={signatureName} onChange={(event) => setSignatureName(event.target.value)} placeholder="Type your full legal name" className="w-full rounded-xl border border-white/10 bg-background p-2 text-sm" />
                  <button disabled={signatureName.trim().length < 2} onClick={() => signAgreement.mutate({ agreementId: agreement.id, signatureName, accepted: true })} className="w-full rounded-xl bg-amber-500 p-2 text-sm font-semibold text-black disabled:opacity-50">Accept, e-sign, and invest</button>
                </div>}
                <div className="p-3 bg-muted/50 rounded-xl flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Wallet Balance</span>
                  <span className="font-semibold text-foreground">${walletBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>

                <div className="grid grid-cols-1 xs:grid-cols-3 sm:grid-cols-3 gap-2 text-center">
                  <div className="p-2 bg-muted/30 rounded-lg">
                    <p className="text-xs text-muted-foreground">ROI</p>
                    <p className="text-sm font-bold text-green-400">{investDialog.roiRange}</p>
                  </div>
                  <div className="p-2 bg-muted/30 rounded-lg">
                    <p className="text-xs text-muted-foreground">Duration</p>
                    <p className="text-sm font-bold text-foreground">{investDialog.durationLabel}</p>
                  </div>
                  <div className="p-2 bg-muted/30 rounded-lg">
                    <p className="text-xs text-muted-foreground">Risk</p>
                    <p className={`text-sm font-bold ${investDialog.risk === "Very Low" || investDialog.risk === "Low" ? "text-green-400" : investDialog.risk === "Medium" ? "text-amber-400" : "text-red-400"}`}>{investDialog.risk}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm text-muted-foreground mb-1.5 block">Investment Amount (USD)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <input
                      type="number"
                      value={investAmount}
                      onChange={e => setInvestAmount(e.target.value)}
                      min={investDialog.minInvest}
                      step="100"
                      className="w-full pl-7 pr-3 py-2.5 bg-background border border-border rounded-xl text-foreground text-sm focus:outline-none focus:border-primary transition"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Minimum: ${investDialog.minInvest.toLocaleString()}</p>
                </div>

                {parseFloat(investAmount) > 0 && (
                  <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Expected Return</span>
                      <span className="font-bold text-green-400">
                        +${(parseFloat(investAmount) * parseFloat(investDialog.roi) / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
                  <button
                    onClick={() => setInvestDialog(null)}
                    className="flex-1 px-4 py-2.5 border border-border text-muted-foreground hover:text-foreground rounded-xl text-sm font-medium transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleInvest}
                    disabled={createInvestment.isPending}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground font-medium rounded-xl text-sm transition hover:opacity-90 disabled:opacity-60 active:scale-[0.97]"
                  >
                    {createInvestment.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                    {createInvestment.isPending ? "Processing..." : "Confirm Investment"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
