/**
 * Security — 2FA, password, active sessions, login history
 */
import { useState } from "react";
import UserDashboardLayout from "@/components/UserDashboardLayout";
import { trpc } from "@/lib/trpc";
import { motion } from "framer-motion";
import { Shield, Smartphone, Key, Eye, Globe, Clock, AlertTriangle, CheckCircle2, Lock } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import SecurityAdvancedPanels from "@/components/SecurityAdvancedPanels";

export default function Security() {
  return (
    <UserDashboardLayout>
      <SecurityContent />
    </UserDashboardLayout>
  );
}

function SecurityContent() {
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const sessions = trpc.session.list.useQuery();
  const revokeSession = trpc.session.revoke.useMutation({
    onSuccess: async () => {
      await utils.session.list.invalidate();
      toast.success("Session revoked");
    },
  });
  const revokeOthers = trpc.session.revokeOthers.useMutation({
    onSuccess: async () => {
      await utils.session.list.invalidate();
      toast.success("Other sessions revoked");
    },
  });
  const toggle2FA = trpc.user.toggle2FA.useMutation({
    onSuccess: () => toast.success("2FA settings updated!"),
    onError: () => toast.error("Failed to update 2FA"),
  });

  const securityScore = 75;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-foreground">Security Center</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Manage your account security settings</p>
      </div>

      {/* Security Score */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card/50 border border-white/5 rounded-2xl p-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Security Score</p>
            <p className="text-3xl font-bold text-foreground">{securityScore}/100</p>
            <p className="text-xs text-amber-400 mt-1">Good — Enable 2FA to reach 95+</p>
          </div>
          <div className="relative w-20 h-20">
            <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="35" fill="none" stroke="currentColor" className="text-white/10" strokeWidth="6" />
              <circle cx="40" cy="40" r="35" fill="none" stroke="currentColor" className="text-amber-500" strokeWidth="6" strokeDasharray={`${securityScore * 2.2} 220`} strokeLinecap="round" />
            </svg>
            <Shield className="absolute inset-0 m-auto w-6 h-6 text-amber-500" />
          </div>
        </div>
      </motion.div>

      {/* Security Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 2FA */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-card/50 border border-white/5 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Two-Factor Authentication</p>
                <p className="text-xs text-muted-foreground">Add an extra layer of security</p>
              </div>
            </div>
            <button
              onClick={() => toggle2FA.mutate({ enabled: !(user as any)?.twoFactorEnabled })}
              className={`relative w-12 h-6 rounded-full transition-colors ${(user as any)?.twoFactorEnabled ? "bg-emerald-500" : "bg-white/20"}`}
            >
              <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${(user as any)?.twoFactorEnabled ? "translate-x-6" : "translate-x-0.5"}`} />
            </button>
          </div>
          <p className="text-[10px] text-muted-foreground">Uses Google Authenticator or similar TOTP app</p>
        </motion.div>

        {/* Password */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card/50 border border-white/5 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Key className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Password</p>
                <p className="text-xs text-muted-foreground">Last changed 30 days ago</p>
              </div>
            </div>
          </div>
          <button onClick={() => toast.info("Password change flow coming soon")} className="w-full py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-foreground hover:bg-white/10 transition-colors">
            Change Password
          </button>
        </motion.div>

        {/* Anti-Phishing */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-card/50 border border-white/5 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <Eye className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Anti-Phishing Code</p>
                <p className="text-xs text-muted-foreground">Verify emails are from us</p>
              </div>
            </div>
            <span className="px-2 py-0.5 text-[10px] font-medium bg-emerald-500/10 text-emerald-400 rounded-full">Active</span>
          </div>
          <p className="text-[10px] text-muted-foreground">Your code: <span className="text-amber-500 font-mono font-semibold">GOLD-****</span></p>
        </motion.div>

        {/* Withdrawal Whitelist */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card/50 border border-white/5 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <Lock className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Withdrawal Whitelist</p>
                <p className="text-xs text-muted-foreground">Only send to approved addresses</p>
              </div>
            </div>
            <span className="px-2 py-0.5 text-[10px] font-medium bg-amber-500/10 text-amber-400 rounded-full">3 addresses</span>
          </div>
          <button onClick={() => toast.info("Whitelist management coming soon")} className="w-full py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-foreground hover:bg-white/10 transition-colors">
            Manage Whitelist
          </button>
        </motion.div>
      </div>

      {/* Active Sessions */}
      <div className="bg-card/50 border border-white/5 rounded-2xl p-5">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-500" />
            <h3 className="text-sm font-semibold text-foreground">Active Sessions</h3>
          </div>
          <button onClick={() => revokeOthers.mutate()} disabled={revokeOthers.isPending} className="px-3 py-1.5 text-xs text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/10 disabled:opacity-50">
            Revoke other sessions
          </button>
        </div>
        <div className="space-y-3">
          {sessions.isLoading && Array.from({ length: 3 }).map((_, index) => <div key={index} className="h-16 bg-white/5 rounded-xl animate-pulse" />)}
          {sessions.data?.map((session) => (
            <div key={session.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-white/5 rounded-xl">
              <div className="flex items-center gap-3">
                <Globe className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs font-medium text-foreground flex items-center gap-2">
                    {session.deviceLabel || "Unknown device"}
                    {session.current && <span className="px-1.5 py-0.5 text-[9px] bg-emerald-500/10 text-emerald-400 rounded-full">Current</span>}
                  </p>
                  <p className="text-[10px] text-muted-foreground">IP address: {session.ip}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-muted-foreground">{new Date(session.lastActiveAt).toLocaleString()}</span>
                {!session.current && <button onClick={() => revokeSession.mutate({ sessionId: session.id })} className="text-xs text-red-400 hover:text-red-300">Revoke</button>}
              </div>
            </div>
          ))}
          {!sessions.isLoading && sessions.data?.length === 0 && <p className="py-6 text-center text-xs text-muted-foreground">No active sessions found.</p>}
        </div>
      </div>
      <SecurityAdvancedPanels />
    </div>
  );
}
