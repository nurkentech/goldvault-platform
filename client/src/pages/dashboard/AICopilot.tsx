import { Bot, ShieldCheck, Sparkles } from "lucide-react";
import UserDashboardLayout from "@/components/UserDashboardLayout";
import CopilotPanel from "@/components/CopilotPanel";

export default function AICopilot() {
  return (
    <UserDashboardLayout>
      <div className="space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-amber-400"><Sparkles className="h-4 w-4" /><span className="text-xs font-semibold uppercase tracking-wider">AI-powered clarity</span></div>
            <h1 className="mt-2 text-3xl font-bold">GoldVault AI Copilot</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">Understand your portfolio, explore illustrative scenarios, and find platform guidance using your current account snapshot.</p>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-3 py-2 text-xs text-emerald-300">
            <ShieldCheck className="h-4 w-4" /> Read-only by design
          </div>
        </header>
        <CopilotPanel />
        <section className="grid gap-3 sm:grid-cols-3">
          {[
            ["Grounded context", "Uses account snapshots and published GoldVaults knowledge-base content."],
            ["Deterministic scenarios", "Market shocks are calculated by server code and clearly labeled as illustrations."],
            ["No execution access", "The AI has no trading, withdrawal, approval, or authentication tools."],
          ].map(([title, description]) => (
            <div key={title} className="rounded-2xl border border-white/5 bg-card/40 p-4">
              <Bot className="h-4 w-4 text-amber-400" />
              <h2 className="mt-2 text-sm font-semibold">{title}</h2>
              <p className="mt-1 text-xs text-muted-foreground">{description}</p>
            </div>
          ))}
        </section>
      </div>
    </UserDashboardLayout>
  );
}
