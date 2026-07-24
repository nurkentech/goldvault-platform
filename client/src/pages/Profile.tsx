/**
 * Profile.tsx — GoldVaults User Profile Page
 * Tabs: Account Details | Security | Notifications
 * Protected: redirects to login if unauthenticated
 */
import { useState, useRef } from "react";
import { Link, useLocation } from "wouter";
import { getLoginUrl } from "@/const";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import {
  ArrowLeft, User, Shield, Bell, Camera, CheckCircle2,
  Clock, XCircle, AlertTriangle, ChevronRight, LogOut,
  Copy, Edit3, Save, X, Globe, Phone, Mail, Lock,
  Eye, EyeOff, Smartphone, Key, Trash2, Crown,
  Star, Zap, Award, Diamond,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const TIER_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode; perks: string[] }> = {
  bronze:    { label: "Bronze",    color: "text-amber-600",  bg: "bg-amber-600/10 border-amber-600/30",  icon: <Star className="w-4 h-4" />,    perks: ["Basic trading", "500 welcome GoldCoins", "Email support"] },
  silver:    { label: "Silver",    color: "text-slate-300",  bg: "bg-slate-400/10 border-slate-400/30",  icon: <Award className="w-4 h-4" />,   perks: ["Lower fees (0.1%)", "Priority support", "Advanced charts"] },
  gold:      { label: "Gold",      color: "text-amber-400",  bg: "bg-amber-400/10 border-amber-400/30",  icon: <Crown className="w-4 h-4" />,   perks: ["0.05% trading fee", "Gold bar minting", "Dedicated manager"] },
  platinum:  { label: "Platinum",  color: "text-cyan-300",   bg: "bg-cyan-300/10 border-cyan-300/30",    icon: <Zap className="w-4 h-4" />,     perks: ["Zero fees", "Instant withdrawals", "OTC desk access"] },
  diamond:   { label: "Diamond",   color: "text-blue-300",   bg: "bg-blue-300/10 border-blue-300/30",    icon: <Diamond className="w-4 h-4" />, perks: ["Negative spread rebates", "Private vault storage", "Concierge"] },
  legendary: { label: "Legendary", color: "text-purple-400", bg: "bg-purple-400/10 border-purple-400/30", icon: <Crown className="w-4 h-4" />, perks: ["All Diamond perks", "Equity stake", "Board advisory access"] },
};

const KYC_CONFIG = {
  unverified: { label: "Unverified", color: "text-slate-400", bg: "bg-slate-700/50", icon: <AlertTriangle className="w-4 h-4" />, desc: "Complete identity verification to unlock full trading limits." },
  pending:    { label: "Under Review", color: "text-amber-400", bg: "bg-amber-500/10", icon: <Clock className="w-4 h-4" />, desc: "Your documents are being reviewed. This usually takes up to 24 hours." },
  verified:   { label: "Verified", color: "text-green-400", bg: "bg-green-500/10", icon: <CheckCircle2 className="w-4 h-4" />, desc: "Your identity has been verified. You have full access to all features." },
  rejected:   { label: "Rejected", color: "text-red-400", bg: "bg-red-500/10", icon: <XCircle className="w-4 h-4" />, desc: "Your verification was rejected. Please resubmit with clearer documents." },
};

const COUNTRIES = ["United States", "United Kingdom", "Canada", "Australia", "Germany", "France", "Japan", "Singapore", "UAE", "India", "Brazil", "South Africa", "Nigeria", "Ghana", "Kenya", "Other"];

export default function Profile() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated, loading, logout } = useAuth({ redirectOnUnauthenticated: true, redirectPath: getLoginUrl("/profile") });
  const utils = trpc.useUtils();

  // Edit state
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [country, setCountry] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // tRPC queries & mutations
  const profileQuery = trpc.user.profile.useQuery(undefined, { enabled: isAuthenticated });
  const updateProfileMutation = trpc.user.updateProfile.useMutation({
    onSuccess: () => {
      utils.user.profile.invalidate();
      utils.auth.me.invalidate();
      setEditing(false);
      toast.success("Profile updated successfully!");
    },
    onError: (e) => toast.error("Failed to update profile", { description: e.message }),
  });
  const updateNotifMutation = trpc.user.updateNotifPrefs.useMutation({
    onSuccess: () => { utils.user.profile.invalidate(); toast.success("Notification preferences saved."); },
  });
  const toggle2FAMutation = trpc.user.toggle2FA.useMutation({
    onSuccess: (_, vars) => { utils.user.profile.invalidate(); toast.success(vars.enabled ? "2FA enabled!" : "2FA disabled."); },
  });
  const submitKycMutation = trpc.user.submitKyc.useMutation({
    onSuccess: () => { utils.user.profile.invalidate(); toast.success("KYC documents submitted! We'll review within 24 hours."); },
    onError: (e) => toast.error("KYC submission failed", { description: e.message }),
  });

  const profile = profileQuery.data;
  const tier = TIER_CONFIG[profile?.tier ?? "bronze"];
  const kyc = KYC_CONFIG[profile?.kycStatus ?? "unverified"];
  const notifPrefs = (profile?.notifPrefs ?? { priceAlerts: true, portfolioUpdates: true, newsDigest: false, securityAlerts: true, marketingEmails: false }) as Record<string, boolean>;

  function startEdit() {
    setName(profile?.name ?? "");
    setUsername(profile?.username ?? "");
    setPhone(profile?.phone ?? "");
    setBio(profile?.bio ?? "");
    setCountry(profile?.country ?? "");
    setEditing(true);
  }

  function handleSave() {
    updateProfileMutation.mutate({ name: name || undefined, username: username || undefined, phone: phone || undefined, bio: bio || undefined, country: country || undefined });
  }

  function handleCopyId() {
    if (!profile) return;
    navigator.clipboard.writeText(`GV-${profile.id.toString().padStart(8, "0")}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleNotifToggle(key: string, val: boolean) {
    updateNotifMutation.mutate({ [key]: val });
  }

  function handleKycSubmit() {
    // In a real app, we'd open a file picker and upload documents
    // For now, we simulate submission with placeholder URLs
    submitKycMutation.mutate({
      documentType: "passport",
      documentFrontUrl: "https://placeholder.goldvaults.us/kyc/doc.jpg",
      selfieUrl: "https://placeholder.goldvaults.us/kyc/selfie.jpg",
    });
  }

  // Loading / unauthenticated states
  if (loading || profileQuery.isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-full border-2 border-amber-500 border-t-transparent animate-spin mx-auto" />
          <p className="text-slate-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="text-center space-y-6 max-w-sm">
          <div className="w-20 h-20 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8 text-amber-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Sign in required</h2>
            <p className="text-slate-400">You need to be signed in to view your profile.</p>
          </div>
          <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold rounded-xl transition-all">
            Go to Homepage
          </Link>
        </div>
      </div>
    );
  }

  const initials = (profile?.name ?? user.name ?? "GV").split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="min-h-screen bg-slate-950" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Top bar */}
      <div className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur border-b border-white/8">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link href="/" className="flex items-center gap-1.5 text-slate-400 hover:text-amber-400 transition-colors text-sm">
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Home</span>
          </Link>
          <div className="w-px h-5 bg-white/10" />
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-900 font-black text-xs">GV</div>
            <span className="font-black text-white text-sm hidden sm:inline">GoldVaults</span>
            <span className="text-slate-500 text-sm hidden sm:inline">/</span>
            <span className="text-amber-400 font-bold text-sm">Profile</span>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <button
              onClick={() => navigate("/dashboard")}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-xs text-slate-300 hover:text-white border border-blue-800/50 rounded-full transition"
            >
              Dashboard
            </button>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-400 hover:text-red-300 border border-red-800/40 hover:border-red-700/60 rounded-full transition"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Profile Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
        >
          <Card className="bg-gradient-to-br from-slate-900 to-blue-950/60 border-blue-800/40 overflow-hidden">
            {/* Cover gradient */}
            <div className="h-28 bg-gradient-to-r from-amber-600/30 via-amber-500/20 to-blue-900/40 relative">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-500/20 via-transparent to-transparent" />
            </div>

            <div className="px-6 pb-6 -mt-12 relative">
              <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                {/* Avatar */}
                <div className="relative w-fit">
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-3xl font-black text-white border-4 border-slate-900 shadow-xl">
                    {profile?.avatarUrl
                      ? <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover rounded-xl" />
                      : initials
                    }
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-1 -right-1 w-7 h-7 rounded-lg bg-amber-500 hover:bg-amber-400 flex items-center justify-center shadow-lg transition"
                  >
                    <Camera className="w-3.5 h-3.5 text-slate-900" />
                  </button>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
                    onChange={() => toast.info("Avatar upload coming soon", { description: "This feature will be available shortly." })}
                  />
                </div>

                {/* Name & badges */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h1 className="text-2xl font-black text-white truncate">{profile?.name ?? user.name ?? "GoldVaults User"}</h1>
                    <Badge className={`${tier.bg} ${tier.color} border text-xs font-bold flex items-center gap-1`}>
                      {tier.icon} {tier.label}
                    </Badge>
                    <Badge className={`${kyc.bg} ${kyc.color} border text-xs font-bold flex items-center gap-1`}>
                      {kyc.icon} {kyc.label}
                    </Badge>
                  </div>
                  <p className="text-slate-400 text-sm">@{profile?.username ?? "goldvaults_user"}</p>
                  {profile?.bio && <p className="text-slate-300 text-sm mt-1">{profile.bio}</p>}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleCopyId}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-400 hover:text-white border border-blue-800/50 rounded-full transition"
                  >
                    {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? "Copied!" : `GV-${profile?.id.toString().padStart(8, "0")}`}
                  </button>
                  {!editing && (
                    <button
                      onClick={startEdit}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-amber-400 hover:text-amber-300 border border-amber-500/30 rounded-full transition"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Edit
                    </button>
                  )}
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-blue-800/40">
                <div className="text-center">
                  <p className="text-xl font-black text-amber-400">{profile?.goldCoins?.toLocaleString() ?? 0}</p>
                  <p className="text-xs text-slate-400 mt-0.5">GoldCoins</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-black text-white">{profile?.totalPoints?.toLocaleString() ?? 0}</p>
                  <p className="text-xs text-slate-400 mt-0.5">Total Points</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-black text-blue-400">#{profile?.leaderboardRank ?? "—"}</p>
                  <p className="text-xs text-slate-400 mt-0.5">Rank</p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: [0.23, 1, 0.32, 1] }}
        >
          <Tabs defaultValue="account">
            <TabsList className="bg-blue-900/40 border border-blue-800/50 w-full sm:w-auto">
              <TabsTrigger value="account" className="data-[state=active]:bg-amber-500 data-[state=active]:text-white text-slate-300 gap-1.5">
                <User className="w-4 h-4" /> Account
              </TabsTrigger>
              <TabsTrigger value="security" className="data-[state=active]:bg-amber-500 data-[state=active]:text-white text-slate-300 gap-1.5">
                <Shield className="w-4 h-4" /> Security
              </TabsTrigger>
              <TabsTrigger value="notifications" className="data-[state=active]:bg-amber-500 data-[state=active]:text-white text-slate-300 gap-1.5">
                <Bell className="w-4 h-4" /> Notifications
              </TabsTrigger>
            </TabsList>

            {/* ── ACCOUNT TAB ── */}
            <TabsContent value="account" className="mt-6 space-y-6">
              {/* Edit form */}
              {editing ? (
                <Card className="bg-blue-900/20 border-blue-800/40 p-6 space-y-5">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-white font-semibold">Edit Profile</h3>
                    <button onClick={() => setEditing(false)} className="text-slate-400 hover:text-white transition">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-slate-400 mb-1 block">Display Name</label>
                      <input value={name} onChange={e => setName(e.target.value)} placeholder="Your full name"
                        className="w-full px-3 py-2.5 bg-blue-950/60 border border-blue-800/50 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500/60 transition" />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 mb-1 block">Username</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">@</span>
                        <input value={username} onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))} placeholder="username"
                          className="w-full pl-7 pr-3 py-2.5 bg-blue-950/60 border border-blue-800/50 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500/60 transition" />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 mb-1 block">Phone Number</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1 555 000 0000"
                          className="w-full pl-9 pr-3 py-2.5 bg-blue-950/60 border border-blue-800/50 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500/60 transition" />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 mb-1 block">Country</label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <select value={country} onChange={e => setCountry(e.target.value)}
                          className="w-full pl-9 pr-3 py-2.5 bg-blue-950/60 border border-blue-800/50 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500/60 transition appearance-none">
                          <option value="">Select country</option>
                          {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Bio <span className="text-slate-600">(optional)</span></label>
                    <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} placeholder="Tell the community about yourself..."
                      className="w-full px-3 py-2.5 bg-blue-950/60 border border-blue-800/50 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500/60 transition resize-none" />
                  </div>
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={handleSave}
                      disabled={updateProfileMutation.isPending}
                      className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-slate-900 font-bold rounded-xl transition-all active:scale-[0.97]"
                    >
                      <Save className="w-4 h-4" />
                      {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                    </button>
                    <button onClick={() => setEditing(false)} className="px-5 py-2.5 text-slate-400 hover:text-white border border-blue-800/50 rounded-xl transition text-sm">
                      Cancel
                    </button>
                  </div>
                </Card>
              ) : (
                <Card className="bg-blue-900/20 border-blue-800/40 p-6">
                  <h3 className="text-white font-semibold mb-4">Account Details</h3>
                  <div className="space-y-4">
                    {[
                      { icon: <User className="w-4 h-4" />, label: "Display Name", value: profile?.name ?? "—" },
                      { icon: <span className="text-slate-400 text-sm font-bold">@</span>, label: "Username", value: profile?.username ? `@${profile.username}` : "—" },
                      { icon: <Mail className="w-4 h-4" />, label: "Email", value: profile?.email ?? user.email ?? "—" },
                      { icon: <Phone className="w-4 h-4" />, label: "Phone", value: profile?.phone ?? "—" },
                      { icon: <Globe className="w-4 h-4" />, label: "Country", value: profile?.country ?? "—" },
                    ].map(({ icon, label, value }) => (
                      <div key={label} className="flex items-center gap-3 py-2 border-b border-blue-800/30 last:border-0">
                        <div className="w-8 h-8 rounded-lg bg-blue-900/60 flex items-center justify-center text-slate-400 shrink-0">{icon}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-slate-500">{label}</p>
                          <p className="text-white text-sm truncate">{value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button onClick={startEdit} className="mt-4 flex items-center gap-2 text-sm text-amber-400 hover:text-amber-300 transition">
                    <Edit3 className="w-4 h-4" /> Edit profile details
                  </button>
                </Card>
              )}

              {/* Account Tier */}
              <Card className={`${tier.bg} border p-6`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className={tier.color}>{tier.icon}</span>
                    <h3 className={`font-bold ${tier.color}`}>{tier.label} Tier</h3>
                  </div>
                  <button onClick={() => toast.info("Tier upgrades coming soon!", { description: "Upgrade tiers will be available when trading goes live." })}
                    className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition">
                    Upgrade <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tier.perks.map(perk => (
                    <span key={perk} className="flex items-center gap-1 text-xs text-slate-300 bg-white/5 px-2.5 py-1 rounded-full">
                      <CheckCircle2 className="w-3 h-3 text-green-400" /> {perk}
                    </span>
                  ))}
                </div>
              </Card>

              {/* KYC Status */}
              <Card className={`${kyc.bg} border border-current/20 p-6`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl ${kyc.bg} flex items-center justify-center ${kyc.color}`}>
                      {kyc.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-white font-semibold">Identity Verification</h3>
                        <Badge className={`${kyc.bg} ${kyc.color} border text-xs`}>{kyc.label}</Badge>
                      </div>
                      <p className="text-slate-400 text-sm mt-0.5">{kyc.desc}</p>
                    </div>
                  </div>
                  {(profile?.kycStatus === "unverified" || profile?.kycStatus === "rejected") && (
                    <button
                      onClick={handleKycSubmit}
                      disabled={submitKycMutation.isPending}
                      className="shrink-0 flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-slate-900 font-bold text-sm rounded-xl transition-all active:scale-[0.97]"
                    >
                      <Shield className="w-4 h-4" />
                      {submitKycMutation.isPending ? "Submitting..." : "Verify Now"}
                    </button>
                  )}
                </div>
              </Card>

              {/* Danger zone */}
              <Card className="bg-red-950/20 border-red-900/30 p-6">
                <h3 className="text-red-400 font-semibold mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> Danger Zone
                </h3>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="text-white text-sm font-medium">Delete Account</p>
                    <p className="text-slate-400 text-xs">Permanently delete your account and all associated data.</p>
                  </div>
                  <button
                    onClick={() => toast.error("Account deletion requires contacting support", { description: "Email support@goldvaults.us to request account deletion." })}
                    className="flex items-center gap-2 px-4 py-2 border border-red-800/50 text-red-400 hover:text-red-300 hover:border-red-700 rounded-xl text-sm transition"
                  >
                    <Trash2 className="w-4 h-4" /> Delete Account
                  </button>
                </div>
              </Card>
            </TabsContent>

            {/* ── SECURITY TAB ── */}
            <TabsContent value="security" className="mt-6 space-y-6">
              {/* 2FA */}
              <Card className="bg-blue-900/20 border-blue-800/40 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                      <Smartphone className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">Two-Factor Authentication</h3>
                      <p className="text-slate-400 text-sm">Add an extra layer of security to your account.</p>
                    </div>
                  </div>
                  <Switch
                    checked={profile?.twoFactorEnabled ?? false}
                    onCheckedChange={(v) => toggle2FAMutation.mutate({ enabled: v })}
                    disabled={toggle2FAMutation.isPending}
                  />
                </div>
                {profile?.twoFactorEnabled && (
                  <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-2 text-green-400 text-sm">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    2FA is active. Your account is protected with authenticator app verification.
                  </div>
                )}
              </Card>

              {/* Change Password */}
              <Card className="bg-blue-900/20 border-blue-800/40 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                    <Lock className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">Password</h3>
                    <p className="text-slate-400 text-sm">Last changed: Never</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {["Current Password", "New Password", "Confirm New Password"].map((label, i) => (
                    <div key={label} className="relative">
                      <label className="text-xs text-slate-400 mb-1 block">{label}</label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className="w-full px-3 py-2.5 bg-blue-950/60 border border-blue-800/50 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500/60 transition pr-10"
                        />
                        {i === 0 && (
                          <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition">
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() => toast.info("Password change coming soon", { description: "This feature will be available in the next update." })}
                    className="mt-2 flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl transition-all active:scale-[0.97]"
                  >
                    <Key className="w-4 h-4" /> Update Password
                  </button>
                </div>
              </Card>

              {/* Active Sessions */}
              <Card className="bg-blue-900/20 border-blue-800/40 p-6">
                <h3 className="text-white font-semibold mb-4">Active Sessions</h3>
                <div className="space-y-3">
                  {[
                    { device: "Chrome on macOS", location: "New York, US", time: "Current session", current: true },
                    { device: "Safari on iPhone", location: "New York, US", time: "2 hours ago", current: false },
                  ].map((session, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-blue-950/40 rounded-xl border border-blue-800/30">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${session.current ? "bg-green-400" : "bg-slate-500"}`} />
                        <div>
                          <p className="text-white text-sm font-medium">{session.device}</p>
                          <p className="text-slate-400 text-xs">{session.location} · {session.time}</p>
                        </div>
                      </div>
                      {!session.current && (
                        <button onClick={() => toast.success("Session revoked")} className="text-xs text-red-400 hover:text-red-300 transition">Revoke</button>
                      )}
                    </div>
                  ))}
                </div>
              </Card>

              {/* Login History */}
              <Card className="bg-blue-900/20 border-blue-800/40 p-6">
                <h3 className="text-white font-semibold mb-4">Recent Login Activity</h3>
                <div className="space-y-2">
                  {[
                    { event: "Successful login", device: "Chrome · macOS", time: "Just now", ok: true },
                    { event: "Successful login", device: "Safari · iPhone", time: "2 hours ago", ok: true },
                    { event: "Failed login attempt", device: "Unknown · Windows", time: "Yesterday", ok: false },
                  ].map((entry, i) => (
                    <div key={i} className="flex items-center gap-3 py-2 border-b border-blue-800/30 last:border-0">
                      <div className={`w-2 h-2 rounded-full shrink-0 ${entry.ok ? "bg-green-400" : "bg-red-400"}`} />
                      <div className="flex-1">
                        <p className="text-white text-sm">{entry.event}</p>
                        <p className="text-slate-500 text-xs">{entry.device}</p>
                      </div>
                      <p className="text-slate-500 text-xs shrink-0">{entry.time}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>

            {/* ── NOTIFICATIONS TAB ── */}
            <TabsContent value="notifications" className="mt-6 space-y-6">
              <Card className="bg-blue-900/20 border-blue-800/40 p-6">
                <h3 className="text-white font-semibold mb-1">Notification Preferences</h3>
                <p className="text-slate-400 text-sm mb-6">Choose what you want to be notified about.</p>

                <div className="space-y-5">
                  {[
                    { key: "priceAlerts", icon: "📈", title: "Price Alerts", desc: "Get notified when assets hit your target prices." },
                    { key: "portfolioUpdates", icon: "💼", title: "Portfolio Updates", desc: "Daily summary of your portfolio performance." },
                    { key: "newsDigest", icon: "📰", title: "News Digest", desc: "Weekly digest of gold and crypto market news." },
                    { key: "securityAlerts", icon: "🔒", title: "Security Alerts", desc: "Immediate alerts for login attempts and account changes." },
                    { key: "marketingEmails", icon: "🎁", title: "Promotions & Offers", desc: "Exclusive deals, new features, and GoldCoins bonuses." },
                  ].map(({ key, icon, title, desc }) => (
                    <div key={key} className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{icon}</span>
                        <div>
                          <p className="text-white text-sm font-medium">{title}</p>
                          <p className="text-slate-400 text-xs">{desc}</p>
                        </div>
                      </div>
                      <Switch
                        checked={notifPrefs[key] ?? false}
                        onCheckedChange={(v) => handleNotifToggle(key, v)}
                        disabled={updateNotifMutation.isPending}
                      />
                    </div>
                  ))}
                </div>
              </Card>

              {/* Email frequency */}
              <Card className="bg-blue-900/20 border-blue-800/40 p-6">
                <h3 className="text-white font-semibold mb-4">Email Frequency</h3>
                <div className="space-y-3">
                  {["Real-time", "Daily digest", "Weekly digest", "Never"].map((freq, i) => (
                    <label key={freq} className="flex items-center gap-3 cursor-pointer group">
                      <input type="radio" name="emailFreq" defaultChecked={i === 0}
                        className="w-4 h-4 accent-amber-500" />
                      <span className="text-slate-300 group-hover:text-white transition text-sm">{freq}</span>
                    </label>
                  ))}
                </div>
                <button
                  onClick={() => toast.success("Email preferences saved!")}
                  className="mt-4 flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold text-sm rounded-xl transition-all active:scale-[0.97]"
                >
                  <Save className="w-4 h-4" /> Save Preferences
                </button>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
