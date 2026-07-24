import { useEffect } from "react";
import { useRoute } from "wouter";
import { getLoginUrl } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";

export default function ReferralLanding() {
  const [, params] = useRoute<{ code: string }>("/ref/:code");
  const { user, loading } = useAuth();
  const code = (params?.code ?? "").toUpperCase();
  useEffect(() => {
    if (!loading && user) window.location.replace("/dashboard/referral");
  }, [loading, user]);
  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-6">
      <section className="w-full max-w-lg rounded-3xl border border-amber-500/20 bg-card p-8 text-center shadow-2xl">
        <div className="mx-auto mb-5 h-14 w-14 rounded-2xl bg-amber-500 text-black grid place-items-center font-black">GV</div>
        <h1 className="text-3xl font-bold text-foreground">You were invited to GoldVaults</h1>
        <p className="mt-3 text-muted-foreground">Create your secure account and referral code <strong className="text-amber-400">{code}</strong> will be applied automatically.</p>
        <button
          disabled={!code || loading}
          onClick={() => { window.location.href = getLoginUrl(`/ref/${code}`); }}
          className="mt-7 w-full rounded-xl bg-amber-500 px-5 py-3 font-semibold text-black hover:bg-amber-400 disabled:opacity-50"
        >
          {loading ? "Checking account…" : "Create account or sign in"}
        </button>
      </section>
    </main>
  );
}
