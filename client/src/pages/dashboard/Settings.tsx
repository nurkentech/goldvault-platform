/**
 * Settings — Profile editing, preferences, account management
 */
import { useEffect, useState } from "react";
import UserDashboardLayout from "@/components/UserDashboardLayout";
import { trpc } from "@/lib/trpc";
import { motion } from "framer-motion";
import { User, Globe, Bell, Palette, Languages, DollarSign, Save } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { Language, useI18n } from "@/contexts/I18nContext";
import { ThemePreference, useTheme } from "@/contexts/ThemeContext";

export default function Settings() {
  return (
    <UserDashboardLayout>
      <SettingsContent />
    </UserDashboardLayout>
  );
}

function SettingsContent() {
  const { user } = useAuth();
  const { language, setLanguage } = useI18n();
  const { preference, setTheme } = useTheme();
  const utils = trpc.useUtils();
  const [displayName, setDisplayName] = useState(user?.name || "");
  const [email] = useState(user?.email || "");
  const [currency, setCurrency] = useState<"USD" | "EUR" | "GBP" | "NGN">("USD");
  const [timezone, setTimezone] = useState("Africa/Lagos");

  const updateProfile = trpc.user.updateProfile.useMutation({
    onSuccess: async () => {
      await Promise.all([utils.auth.me.invalidate(), utils.user.profile.invalidate()]);
      toast.success("Settings saved!");
    },
    onError: () => toast.error("Failed to save settings"),
  });

  const handleSave = () => {
    updateProfile.mutate({ name: displayName, preferredCurrency: currency, preferredLanguage: language, themePreference: preference });
  };

  useEffect(() => {
    if (user?.preferredCurrency) setCurrency(user.preferredCurrency);
    if (user?.name) setDisplayName(user.name);
  }, [user?.name, user?.preferredCurrency]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Settings</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Manage your account preferences</p>
        </div>
        <button
          onClick={handleSave}
          disabled={updateProfile.isPending}
          className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-black font-semibold rounded-xl hover:bg-amber-400 transition-colors text-sm disabled:opacity-50"
        >
          <Save className="w-4 h-4" /> Save Changes
        </button>
      </div>

      {/* Profile Section */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card/50 border border-white/5 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <User className="w-5 h-5 text-amber-500" />
          <h3 className="text-sm font-semibold text-foreground">Profile Information</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Display Name</label>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Email</label>
            <input
              value={email}
              disabled
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-foreground/50 cursor-not-allowed"
            />
          </div>
        </div>
      </motion.div>

      {/* Preferences */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-card/50 border border-white/5 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <Globe className="w-5 h-5 text-amber-500" />
          <h3 className="text-sm font-semibold text-foreground">Preferences</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Currency</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as typeof currency)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/50 appearance-none"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="NGN">NGN (₦)</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/50 appearance-none"
            >
              <option value="en">English</option>
              <option value="pt">Português</option>
              <option value="fr">Français</option>
              <option value="es">Español</option>
              <option value="ar">العربية</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Theme</label>
            <select value={preference} onChange={(e) => setTheme(e.target.value as ThemePreference)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/50 appearance-none">
              <option value="system">System preference</option><option value="dark">Dark</option><option value="light">Light</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Timezone</label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/50 appearance-none"
            >
              <option value="Africa/Lagos">Africa/Lagos (WAT)</option>
              <option value="America/New_York">America/New_York (EST)</option>
              <option value="Europe/London">Europe/London (GMT)</option>
              <option value="Asia/Dubai">Asia/Dubai (GST)</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Notification Preferences */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card/50 border border-white/5 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <Bell className="w-5 h-5 text-amber-500" />
          <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
        </div>
        <div className="space-y-4">
          {[
            { label: "Price Alerts", desc: "Get notified when prices hit your targets" },
            { label: "Trade Confirmations", desc: "Receive confirmation for every trade" },
            { label: "Security Alerts", desc: "Login attempts and security changes" },
            { label: "Marketing Updates", desc: "New features, promotions, and news" },
            { label: "Portfolio Reports", desc: "Weekly portfolio performance summary" },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between py-2">
              <div>
                <p className="text-xs font-medium text-foreground">{item.label}</p>
                <p className="text-[10px] text-muted-foreground">{item.desc}</p>
              </div>
              <button
                onClick={() => toast.success(`${item.label} preference updated`)}
                className="relative w-10 h-5 rounded-full bg-emerald-500 transition-colors"
              >
                <div className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-white shadow-sm" />
              </button>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Danger Zone */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-card/50 border border-red-500/20 rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-red-400 mb-3">Danger Zone</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-foreground">Delete Account</p>
            <p className="text-[10px] text-muted-foreground">Permanently delete your account and all data</p>
          </div>
          <button onClick={() => toast.error("Account deletion requires support ticket")} className="px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl text-xs font-medium hover:bg-red-500/20 transition-colors">
            Delete Account
          </button>
        </div>
      </motion.div>
    </div>
  );
}
