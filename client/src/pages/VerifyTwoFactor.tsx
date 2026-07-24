import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export default function VerifyTwoFactor() {
  const [code,setCode]=useState(""); const status=trpc.twoFactor.loginStatus.useQuery();
  const verify=trpc.twoFactor.completeLogin.useMutation({onSuccess:()=>window.location.replace("/dashboard"),onError:(e)=>toast.error(e.message)}); const sms=trpc.twoFactor.sendLoginSms.useMutation({onSuccess:()=>toast.success("SMS verification code sent"),onError:(e)=>toast.error(e.message)});
  return <main className="min-h-screen bg-background grid place-items-center p-4"><section className="w-full max-w-md rounded-3xl border border-white/10 bg-card p-7 text-center"><ShieldCheck className="w-12 h-12 mx-auto text-amber-500"/><h1 className="text-2xl font-bold mt-4">Two-factor verification</h1><p className="text-sm text-muted-foreground mt-2">Enter your authenticator, SMS, or backup code to finish signing in.</p>{status.data&&!status.data.required?<p className="mt-5 text-sm text-emerald-400">This session is already verified.</p>:<><input autoFocus aria-label="Two-factor verification code" value={code} onChange={(e)=>setCode(e.target.value.trim())} className="w-full mt-6 rounded-xl border border-white/10 bg-background p-3 text-center font-mono tracking-widest" placeholder="000000 or backup code"/><button disabled={code.length<6||verify.isPending} onClick={()=>verify.mutate({code})} className="w-full mt-3 rounded-xl bg-amber-500 p-3 font-semibold text-black disabled:opacity-50">Verify session</button><button onClick={()=>sms.mutate()} className="mt-3 text-sm text-blue-400">Send SMS fallback</button></>}</section></main>;
}
