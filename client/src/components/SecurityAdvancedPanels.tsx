import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { BellRing, Copy, KeyRound, MapPin, ShieldCheck } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";

function urlBase64ToUint8Array(value: string) {
  const padding = "=".repeat((4 - value.length % 4) % 4);
  const base64 = (value + padding).replace(/-/g, "+").replace(/_/g, "/");
  return Uint8Array.from(atob(base64), (character) => character.charCodeAt(0));
}

export default function SecurityAdvancedPanels() {
  const { user } = useAuth(); const utils = trpc.useUtils();
  const status = trpc.twoFactor.status.useQuery(); const trusted = trpc.advanced.trustedIps.list.useQuery(); const currentIp = trpc.advanced.trustedIps.current.useQuery(); const pushKey = trpc.advanced.push.publicKey.useQuery();
  const [setup, setSetup] = useState<{ qrCode: string; secret: string } | null>(null); const [code, setCode] = useState(""); const [backupCodes, setBackupCodes] = useState<string[]>([]); const [ipCode, setIpCode] = useState("");
  const setupMutation = trpc.twoFactor.setup.useMutation({ onSuccess: setSetup });
  const enable = trpc.twoFactor.enable.useMutation({ onSuccess: async (data) => { setBackupCodes(data.backupCodes); setSetup(null); await status.refetch(); toast.success("Two-factor authentication enabled"); }, onError: (e) => toast.error(e.message) });
  const sendOtp = trpc.otp.send.useMutation({ onSuccess: () => toast.success("Verification code sent to your email") });
  const addIp = trpc.advanced.trustedIps.add.useMutation({ onSuccess: async () => { setIpCode(""); await trusted.refetch(); toast.success("Trusted IP verified"); }, onError: (e) => toast.error(e.message) });
  const removeIp = trpc.advanced.trustedIps.remove.useMutation({ onSuccess: () => trusted.refetch() });
  const subscribe = trpc.advanced.push.subscribe.useMutation({ onSuccess: () => toast.success("Browser push notifications enabled") });
  async function enablePush() {
    if (!pushKey.data?.publicKey) return toast.error("VAPID_PUBLIC_KEY is not configured on the server");
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return toast.error("Push notifications are not supported by this browser");
    const permission = await Notification.requestPermission(); if (permission !== "granted") return toast.error("Notification permission was not granted");
    const registration = await navigator.serviceWorker.register("/sw.js");
    const subscription = await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(pushKey.data.publicKey) });
    const json = subscription.toJSON(); if (!json.endpoint || !json.keys?.p256dh || !json.keys.auth) throw new Error("Incomplete push subscription");
    subscribe.mutate({ endpoint: json.endpoint, keys: { p256dh: json.keys.p256dh, auth: json.keys.auth } });
  }
  return <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
    <section className="rounded-2xl border border-white/5 bg-card/50 p-5"><ShieldCheck className="w-5 h-5 text-amber-500"/><h3 className="font-semibold mt-2">Authenticator 2FA</h3><p className="text-xs text-muted-foreground">{status.data?.enabled ? `Enabled · ${status.data.backupCodesRemaining} backup codes remaining` : "Protect withdrawals with TOTP, backup codes, or SMS fallback."}</p>{!status.data?.enabled && <button onClick={() => setupMutation.mutate()} className="mt-3 rounded-xl bg-amber-500 text-black px-4 py-2 text-sm">Set up 2FA</button>}{setup && <div className="mt-4 space-y-2"><img src={setup.qrCode} alt="Authenticator QR code" className="w-40 h-40 rounded bg-white p-2"/><code className="block break-all text-xs">{setup.secret}</code><input aria-label="Authenticator verification code" value={code} onChange={(e)=>setCode(e.target.value)} className="w-full rounded-xl bg-background border border-white/10 p-2"/><button onClick={()=>enable.mutate({code})} className="rounded-xl bg-emerald-500 text-black px-4 py-2">Verify and enable</button></div>}{backupCodes.length > 0 && <div className="mt-3 rounded-xl bg-red-500/10 p-3"><p className="text-xs font-semibold">Save these once-only recovery codes</p><code className="text-xs whitespace-pre-wrap">{backupCodes.join("\n")}</code><button aria-label="Copy recovery codes" onClick={()=>navigator.clipboard.writeText(backupCodes.join("\n"))}><Copy className="w-4 h-4 ml-2"/></button></div>}</section>
    <section className="rounded-2xl border border-white/5 bg-card/50 p-5"><MapPin className="w-5 h-5 text-blue-400"/><h3 className="font-semibold mt-2">Withdrawal IP whitelist</h3><p className="text-xs text-muted-foreground">Current IP: {currentIp.data?.ipAddress ?? "Detecting…"}. New IPs impose a 24-hour withdrawal hold.</p><div className="flex gap-2 mt-3"><button disabled={!user?.email || !currentIp.data} onClick={()=>user?.email && sendOtp.mutate({identifier:user.email,method:"email"})} className="rounded-lg border border-white/10 px-3 py-2 text-xs">Email code</button><input aria-label="Email verification code" maxLength={6} value={ipCode} onChange={(e)=>setIpCode(e.target.value)} className="min-w-0 flex-1 rounded-lg bg-background border border-white/10 px-2"/><button disabled={!currentIp.data || ipCode.length!==6} onClick={()=>currentIp.data && addIp.mutate({ipAddress:currentIp.data.ipAddress,label:"Current device",emailCode:ipCode})} className="rounded-lg bg-blue-500 px-3 py-2 text-xs text-white">Trust</button></div>{trusted.data?.map((item)=><div key={item.id} className="flex justify-between text-xs mt-2 rounded-lg bg-white/5 p-2"><span>{item.ipAddress} · {item.label}</span><button onClick={()=>removeIp.mutate({id:item.id})} className="text-red-400">Remove</button></div>)}</section>
    <section className="rounded-2xl border border-white/5 bg-card/50 p-5"><BellRing className="w-5 h-5 text-purple-400"/><h3 className="font-semibold mt-2">Browser push alerts</h3><p className="text-xs text-muted-foreground">Receive deposit, withdrawal, and maturity alerts through the installed GoldVaults service worker.</p><button onClick={enablePush} className="mt-3 rounded-xl bg-purple-500/20 text-purple-300 px-4 py-2 text-sm">Enable push notifications</button></section>
  </div>;
}
