import { useState, useEffect } from "react";
import { Save, Shield, Globe, DollarSign, Bell, Zap, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

interface PlatformSettings {
  general: {
    platformName: string;
    supportEmail: string;
    defaultCurrency: "USD" | "EUR" | "GBP" | "NGN";
    timezone: string;
    enableRegistrations: boolean;
    requireEmailVerification: boolean;
  };
  fees: {
    tradingFee: string;
    withdrawalFee: string;
    depositFee: string;
    minDeposit: string;
    maxWithdrawal: string;
    dailyWithdrawalLimit: string;
  };
  security: {
    requireKycForWithdrawals: boolean;
    enforce2faAdmin: boolean;
    autoLockSuspicious: boolean;
    ipWhitelist: boolean;
  };
  notifications: {
    emailOnRegistration: boolean;
    emailOnLargeWithdrawal: boolean;
    emailOnKycSubmission: boolean;
    dailySummary: boolean;
  };
  maintenance: {
    enabled: boolean;
    message: string;
    startTime: string;
    endTime: string;
  };
  supportedAssets: string[];
  depositAddresses: Record<string, string>;
  compliance: { largeTransactionThreshold: string; rapidWithdrawalCount: number; rapidWithdrawalWindowMinutes: number };
}

const defaultSettings: PlatformSettings = {
  general: {
    platformName: "GoldVaults",
    supportEmail: "support@goldvaults.us",
    defaultCurrency: "USD",
    timezone: "UTC",
    enableRegistrations: true,
    requireEmailVerification: true,
  },
  fees: {
    tradingFee: "0.5",
    withdrawalFee: "1.0",
    depositFee: "0",
    minDeposit: "10",
    maxWithdrawal: "50000",
    dailyWithdrawalLimit: "10000",
  },
  security: {
    requireKycForWithdrawals: true,
    enforce2faAdmin: true,
    autoLockSuspicious: true,
    ipWhitelist: false,
  },
  notifications: {
    emailOnRegistration: true,
    emailOnLargeWithdrawal: true,
    emailOnKycSubmission: true,
    dailySummary: false,
  },
  maintenance: {
    enabled: false,
    message: "We are currently performing scheduled maintenance. Please check back soon.",
    startTime: "",
    endTime: "",
  },
  supportedAssets: ["USDT", "BTC", "ETH", "GOLD", "XAU"],
  depositAddresses: {},
  compliance: { largeTransactionThreshold: "10000", rapidWithdrawalCount: 3, rapidWithdrawalWindowMinutes: 60 },
};

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState("general");
  const [settings, setSettings] = useState<PlatformSettings>(defaultSettings);
  const [newAsset, setNewAsset] = useState("");
  const utils = trpc.useUtils();
  const settingsQuery = trpc.admin.settings.get.useQuery();
  const updateSettings = trpc.admin.settings.update.useMutation();
  const saving = updateSettings.isPending;

  useEffect(() => {
    if (settingsQuery.data) setSettings(settingsQuery.data);
  }, [settingsQuery.data]);

  const handleSave = async () => {
    try {
      const saved = await updateSettings.mutateAsync(settings);
      setSettings(saved);
      await utils.admin.settings.get.invalidate();
      toast.success("Settings saved successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save settings");
    }
  };

  const updateGeneral = (key: keyof PlatformSettings["general"], value: string | boolean) => {
    setSettings(prev => ({ ...prev, general: { ...prev.general, [key]: value } }));
  };
  const updateFees = (key: keyof PlatformSettings["fees"], value: string) => {
    setSettings(prev => ({ ...prev, fees: { ...prev.fees, [key]: value } }));
  };
  const updateSecurity = (key: keyof PlatformSettings["security"], value: boolean) => {
    setSettings(prev => ({ ...prev, security: { ...prev.security, [key]: value } }));
  };
  const updateNotifications = (key: keyof PlatformSettings["notifications"], value: boolean) => {
    setSettings(prev => ({ ...prev, notifications: { ...prev.notifications, [key]: value } }));
  };
  const updateMaintenance = (key: keyof PlatformSettings["maintenance"], value: string | boolean) => {
    setSettings(prev => ({ ...prev, maintenance: { ...prev.maintenance, [key]: value } }));
  };

  const addAsset = () => {
    const asset = newAsset.trim().toUpperCase();
    if (!asset) return;
    if (settings.supportedAssets.includes(asset)) { toast.error("Asset already exists"); return; }
    setSettings(prev => ({ ...prev, supportedAssets: [...prev.supportedAssets, asset] }));
    setNewAsset("");
  };

  const removeAsset = (asset: string) => {
    setSettings(prev => ({ ...prev, supportedAssets: prev.supportedAssets.filter(a => a !== asset) }));
  };

  const tabs = [
    { id: "general", label: "General", icon: Globe },
    { id: "fees", label: "Fees & Limits", icon: DollarSign },
    { id: "security", label: "Security", icon: Shield },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "maintenance", label: "Maintenance", icon: Zap },
  ];

  const SaveButton = () => (
    <button onClick={handleSave} disabled={saving || settingsQuery.isLoading}
      className="h-10 px-5 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-medium rounded-lg text-sm hover:from-amber-400 hover:to-amber-500 transition-all flex items-center gap-2 disabled:opacity-50">
      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
      Save Changes
    </button>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Platform Settings</h1>
        <p className="text-sm text-gray-400 mt-1">Configure global platform parameters and policies</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-[#0d1321] border border-gray-800/60 rounded-xl p-1.5 overflow-x-auto">
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === tab.id ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" : "text-gray-400 hover:text-white hover:bg-gray-800/50"
            }`}>
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* General Settings */}
      {activeTab === "general" && (
        <div className="bg-[#0d1321] border border-gray-800/60 rounded-xl p-6 space-y-6">
          <h3 className="text-lg font-semibold text-white">General Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Platform Name</label>
              <input type="text" value={settings.general.platformName}
                onChange={(e) => updateGeneral("platformName", e.target.value)}
                className="w-full h-10 px-3 bg-[#080d19] border border-gray-800 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500/50" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Support Email</label>
              <input type="email" value={settings.general.supportEmail}
                onChange={(e) => updateGeneral("supportEmail", e.target.value)}
                className="w-full h-10 px-3 bg-[#080d19] border border-gray-800 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500/50" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Default Currency</label>
              <select value={settings.general.defaultCurrency}
                onChange={(e) => updateGeneral("defaultCurrency", e.target.value)}
                className="w-full h-10 px-3 bg-[#080d19] border border-gray-800 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500/50">
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="NGN">NGN</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Timezone</label>
              <select value={settings.general.timezone}
                onChange={(e) => updateGeneral("timezone", e.target.value)}
                className="w-full h-10 px-3 bg-[#080d19] border border-gray-800 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500/50">
                <option value="UTC">UTC</option>
                <option value="America/New_York">Eastern (US)</option>
                <option value="Europe/London">London (UK)</option>
                <option value="Africa/Lagos">Lagos (WAT)</option>
              </select>
            </div>
          </div>
          <div className="flex flex-col gap-3 pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={settings.general.enableRegistrations}
                onChange={(e) => updateGeneral("enableRegistrations", e.target.checked)}
                className="w-4 h-4 rounded border-gray-700 bg-gray-800 text-amber-500 focus:ring-amber-500/30" />
              <span className="text-sm text-gray-300">Enable new user registrations</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={settings.general.requireEmailVerification}
                onChange={(e) => updateGeneral("requireEmailVerification", e.target.checked)}
                className="w-4 h-4 rounded border-gray-700 bg-gray-800 text-amber-500 focus:ring-amber-500/30" />
              <span className="text-sm text-gray-300">Require email verification</span>
            </label>
          </div>

          {/* Supported Assets */}
          <div className="pt-4 border-t border-gray-800/60">
            <h4 className="text-sm font-semibold text-white mb-3">Supported Assets</h4>
            <div className="flex flex-wrap gap-2 mb-3">
              {settings.supportedAssets.map((asset) => (
                <span key={asset} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800/60 border border-gray-700 rounded-lg text-xs text-white font-medium">
                  {asset}
                  <button onClick={() => removeAsset(asset)} className="text-gray-500 hover:text-red-400 transition-colors text-lg leading-none">&times;</button>
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input type="text" value={newAsset} onChange={(e) => setNewAsset(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addAsset()}
                placeholder="Add asset (e.g. SOL)"
                className="h-9 px-3 bg-[#080d19] border border-gray-800 rounded-lg text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-amber-500/50 w-40" />
              <button onClick={addAsset}
                className="h-9 px-3 bg-gray-800 text-gray-300 rounded-lg text-sm hover:bg-gray-700 transition-colors">
                Add
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-800/60">
            <h4 className="text-sm font-semibold text-white mb-1">Crypto Deposit Addresses</h4>
            <p className="text-xs text-gray-500 mb-3">Users will see these addresses during crypto deposits.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {settings.supportedAssets.map((asset) => (
                <label key={asset} className="space-y-1">
                  <span className="text-xs text-gray-400">{asset}</span>
                  <input
                    value={settings.depositAddresses[asset] ?? ""}
                    onChange={(event) => {
                      const address = event.target.value.trim();
                      setSettings((previous) => {
                        const depositAddresses = { ...previous.depositAddresses };
                        if (address) depositAddresses[asset] = address;
                        else delete depositAddresses[asset];
                        return { ...previous, depositAddresses };
                      });
                    }}
                    placeholder={`Enter ${asset} deposit address`}
                    className="w-full h-10 px-3 bg-[#080d19] border border-gray-800 rounded-lg text-sm text-white font-mono placeholder:text-gray-600 focus:outline-none focus:border-amber-500/50"
                  />
                </label>
              ))}
            </div>
          </div>

          <SaveButton />
        </div>
      )}

      {/* Fees & Limits */}
      {activeTab === "fees" && (
        <div className="bg-[#0d1321] border border-gray-800/60 rounded-xl p-6 space-y-6">
          <h3 className="text-lg font-semibold text-white">Fees & Limits</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Trading Fee (%)</label>
              <input type="number" value={settings.fees.tradingFee} step="0.1"
                onChange={(e) => updateFees("tradingFee", e.target.value)}
                className="w-full h-10 px-3 bg-[#080d19] border border-gray-800 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500/50" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Withdrawal Fee (%)</label>
              <input type="number" value={settings.fees.withdrawalFee} step="0.1"
                onChange={(e) => updateFees("withdrawalFee", e.target.value)}
                className="w-full h-10 px-3 bg-[#080d19] border border-gray-800 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500/50" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Deposit Fee (%)</label>
              <input type="number" value={settings.fees.depositFee} step="0.1"
                onChange={(e) => updateFees("depositFee", e.target.value)}
                className="w-full h-10 px-3 bg-[#080d19] border border-gray-800 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500/50" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Min Deposit ($)</label>
              <input type="number" value={settings.fees.minDeposit}
                onChange={(e) => updateFees("minDeposit", e.target.value)}
                className="w-full h-10 px-3 bg-[#080d19] border border-gray-800 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500/50" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Max Withdrawal ($)</label>
              <input type="number" value={settings.fees.maxWithdrawal}
                onChange={(e) => updateFees("maxWithdrawal", e.target.value)}
                className="w-full h-10 px-3 bg-[#080d19] border border-gray-800 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500/50" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Daily Withdrawal Limit ($)</label>
              <input type="number" value={settings.fees.dailyWithdrawalLimit}
                onChange={(e) => updateFees("dailyWithdrawalLimit", e.target.value)}
                className="w-full h-10 px-3 bg-[#080d19] border border-gray-800 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500/50" />
            </div>
          </div>
          <SaveButton />
        </div>
      )}

      {/* Security Settings */}
      {activeTab === "security" && (
        <div className="bg-[#0d1321] border border-gray-800/60 rounded-xl p-6 space-y-6">
          <h3 className="text-lg font-semibold text-white">Security Settings</h3>
          <div className="space-y-4">
            <label className="flex items-center justify-between p-4 bg-[#080d19] rounded-lg border border-gray-800">
              <div>
                <p className="text-sm font-medium text-white">Require KYC for withdrawals</p>
                <p className="text-xs text-gray-500 mt-0.5">Users must complete identity verification before withdrawing funds</p>
              </div>
              <input type="checkbox" checked={settings.security.requireKycForWithdrawals}
                onChange={(e) => updateSecurity("requireKycForWithdrawals", e.target.checked)}
                className="w-4 h-4 rounded border-gray-700 bg-gray-800 text-amber-500 focus:ring-amber-500/30" />
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 bg-[#080d19] rounded-lg border border-gray-800">
              <label className="text-xs text-gray-400">Large transaction threshold<input aria-label="Large transaction threshold" value={settings.compliance.largeTransactionThreshold} onChange={(e)=>setSettings((previous)=>({...previous,compliance:{...previous.compliance,largeTransactionThreshold:e.target.value}}))} className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-900 p-2 text-white"/></label>
              <label className="text-xs text-gray-400">Rapid withdrawal count<input aria-label="Rapid withdrawal count" type="number" value={settings.compliance.rapidWithdrawalCount} onChange={(e)=>setSettings((previous)=>({...previous,compliance:{...previous.compliance,rapidWithdrawalCount:Number(e.target.value)}}))} className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-900 p-2 text-white"/></label>
              <label className="text-xs text-gray-400">Window (minutes)<input aria-label="Rapid withdrawal window" type="number" value={settings.compliance.rapidWithdrawalWindowMinutes} onChange={(e)=>setSettings((previous)=>({...previous,compliance:{...previous.compliance,rapidWithdrawalWindowMinutes:Number(e.target.value)}}))} className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-900 p-2 text-white"/></label>
            </div>
            <label className="flex items-center justify-between p-4 bg-[#080d19] rounded-lg border border-gray-800">
              <div>
                <p className="text-sm font-medium text-white">Enforce 2FA for admin accounts</p>
                <p className="text-xs text-gray-500 mt-0.5">All admin users must enable two-factor authentication</p>
              </div>
              <input type="checkbox" checked={settings.security.enforce2faAdmin}
                onChange={(e) => updateSecurity("enforce2faAdmin", e.target.checked)}
                className="w-4 h-4 rounded border-gray-700 bg-gray-800 text-amber-500 focus:ring-amber-500/30" />
            </label>
            <label className="flex items-center justify-between p-4 bg-[#080d19] rounded-lg border border-gray-800">
              <div>
                <p className="text-sm font-medium text-white">Auto-lock suspicious accounts</p>
                <p className="text-xs text-gray-500 mt-0.5">Automatically suspend accounts with unusual activity patterns</p>
              </div>
              <input type="checkbox" checked={settings.security.autoLockSuspicious}
                onChange={(e) => updateSecurity("autoLockSuspicious", e.target.checked)}
                className="w-4 h-4 rounded border-gray-700 bg-gray-800 text-amber-500 focus:ring-amber-500/30" />
            </label>
            <label className="flex items-center justify-between p-4 bg-[#080d19] rounded-lg border border-gray-800">
              <div>
                <p className="text-sm font-medium text-white">IP whitelist for admin panel</p>
                <p className="text-xs text-gray-500 mt-0.5">Restrict admin access to specific IP addresses</p>
              </div>
              <input type="checkbox" checked={settings.security.ipWhitelist}
                onChange={(e) => updateSecurity("ipWhitelist", e.target.checked)}
                className="w-4 h-4 rounded border-gray-700 bg-gray-800 text-amber-500 focus:ring-amber-500/30" />
            </label>
          </div>
          <SaveButton />
        </div>
      )}

      {/* Notifications */}
      {activeTab === "notifications" && (
        <div className="bg-[#0d1321] border border-gray-800/60 rounded-xl p-6 space-y-6">
          <h3 className="text-lg font-semibold text-white">Notification Settings</h3>
          <div className="space-y-4">
            <label className="flex items-center justify-between p-4 bg-[#080d19] rounded-lg border border-gray-800">
              <div>
                <p className="text-sm font-medium text-white">Email on new user registration</p>
                <p className="text-xs text-gray-500 mt-0.5">Receive email when a new user signs up</p>
              </div>
              <input type="checkbox" checked={settings.notifications.emailOnRegistration}
                onChange={(e) => updateNotifications("emailOnRegistration", e.target.checked)}
                className="w-4 h-4 rounded border-gray-700 bg-gray-800 text-amber-500 focus:ring-amber-500/30" />
            </label>
            <label className="flex items-center justify-between p-4 bg-[#080d19] rounded-lg border border-gray-800">
              <div>
                <p className="text-sm font-medium text-white">Email on large withdrawal request</p>
                <p className="text-xs text-gray-500 mt-0.5">Notify when withdrawal exceeds $5,000</p>
              </div>
              <input type="checkbox" checked={settings.notifications.emailOnLargeWithdrawal}
                onChange={(e) => updateNotifications("emailOnLargeWithdrawal", e.target.checked)}
                className="w-4 h-4 rounded border-gray-700 bg-gray-800 text-amber-500 focus:ring-amber-500/30" />
            </label>
            <label className="flex items-center justify-between p-4 bg-[#080d19] rounded-lg border border-gray-800">
              <div>
                <p className="text-sm font-medium text-white">Email on KYC submission</p>
                <p className="text-xs text-gray-500 mt-0.5">Notify when a user submits KYC documents for review</p>
              </div>
              <input type="checkbox" checked={settings.notifications.emailOnKycSubmission}
                onChange={(e) => updateNotifications("emailOnKycSubmission", e.target.checked)}
                className="w-4 h-4 rounded border-gray-700 bg-gray-800 text-amber-500 focus:ring-amber-500/30" />
            </label>
            <label className="flex items-center justify-between p-4 bg-[#080d19] rounded-lg border border-gray-800">
              <div>
                <p className="text-sm font-medium text-white">Daily summary report</p>
                <p className="text-xs text-gray-500 mt-0.5">Receive a daily email with platform metrics and activity</p>
              </div>
              <input type="checkbox" checked={settings.notifications.dailySummary}
                onChange={(e) => updateNotifications("dailySummary", e.target.checked)}
                className="w-4 h-4 rounded border-gray-700 bg-gray-800 text-amber-500 focus:ring-amber-500/30" />
            </label>
          </div>
          <SaveButton />
        </div>
      )}

      {/* Maintenance */}
      {activeTab === "maintenance" && (
        <div className="bg-[#0d1321] border border-gray-800/60 rounded-xl p-6 space-y-6">
          <h3 className="text-lg font-semibold text-white">Maintenance Mode</h3>
          <div className="p-4 bg-[#080d19] rounded-lg border border-gray-800 space-y-4">
            <label className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">Enable Maintenance Mode</p>
                <p className="text-xs text-gray-500 mt-0.5">Temporarily disable all user access to the platform</p>
              </div>
              <input type="checkbox" checked={settings.maintenance.enabled}
                onChange={(e) => updateMaintenance("enabled", e.target.checked)}
                className="w-4 h-4 rounded border-gray-700 bg-gray-800 text-amber-500 focus:ring-amber-500/30" />
            </label>
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Maintenance Message</label>
              <textarea rows={3} value={settings.maintenance.message}
                onChange={(e) => updateMaintenance("message", e.target.value)}
                className="w-full px-3 py-2 bg-[#0d1321] border border-gray-800 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500/50 resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Start Time</label>
                <input type="datetime-local" value={settings.maintenance.startTime}
                  onChange={(e) => updateMaintenance("startTime", e.target.value)}
                  className="w-full h-10 px-3 bg-[#0d1321] border border-gray-800 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500/50" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">End Time</label>
                <input type="datetime-local" value={settings.maintenance.endTime}
                  onChange={(e) => updateMaintenance("endTime", e.target.value)}
                  className="w-full h-10 px-3 bg-[#0d1321] border border-gray-800 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500/50" />
              </div>
            </div>
          </div>
          <div className="p-4 bg-[#080d19] rounded-lg border border-gray-800 space-y-3">
            <p className="text-sm font-medium text-white">Danger Zone</p>
            <div className="flex items-center gap-3">
              <button onClick={() => toast.info("Cache cleared")}
                className="h-9 px-4 bg-gray-800 text-gray-300 rounded-lg text-sm hover:bg-gray-700 transition-colors">
                Clear Cache
              </button>
              <button onClick={() => toast.info("Queues restarted")}
                className="h-9 px-4 bg-gray-800 text-gray-300 rounded-lg text-sm hover:bg-gray-700 transition-colors">
                Restart Queues
              </button>
              <button onClick={() => toast.info("Logs exported")}
                className="h-9 px-4 bg-gray-800 text-gray-300 rounded-lg text-sm hover:bg-gray-700 transition-colors">
                Export Logs
              </button>
            </div>
          </div>
          <SaveButton />
        </div>
      )}
    </div>
  );
}
