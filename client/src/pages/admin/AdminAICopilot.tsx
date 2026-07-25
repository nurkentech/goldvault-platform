import { useState } from "react";
import {
  Bot,
  Clipboard,
  FileSearch,
  LifeBuoy,
  Loader2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

type GeneratedResponse = {
  answer: string;
  summary: string;
  insights: Array<{ title: string; detail: string; severity: "info" | "positive" | "warning" }>;
  disclaimer: string;
};

export default function AdminAICopilot() {
  const [mode, setMode] = useState<"support" | "compliance">("support");
  const [selectedTicket, setSelectedTicket] = useState<number | null>(null);
  const [selectedAlert, setSelectedAlert] = useState<number | null>(null);
  const [instruction, setInstruction] = useState("");
  const [result, setResult] = useState<GeneratedResponse | null>(null);
  const tickets = trpc.advanced.admin.tickets.list.useQuery(undefined, { enabled: mode === "support" });
  const alerts = trpc.advanced.admin.aml.list.useQuery({}, { enabled: mode === "compliance" });
  const supportDraft = trpc.ai.admin.supportDraft.useMutation({
    onSuccess: (data) => setResult(data.response),
    onError: (error) => toast.error(error.message),
  });
  const complianceSummary = trpc.ai.admin.complianceSummary.useMutation({
    onSuccess: (data) => setResult(data.response),
    onError: (error) => toast.error(error.message),
  });
  const pending = supportDraft.isPending || complianceSummary.isPending;

  async function copyResult() {
    if (!result) return;
    await navigator.clipboard.writeText(result.answer);
    toast.success("AI draft copied");
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="flex items-center gap-2 text-amber-400">
            <Sparkles className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">Human-in-the-loop operations</span>
          </div>
          <h1 className="mt-2 text-2xl font-bold">AI Review Copilot</h1>
          <p className="mt-1 max-w-2xl text-sm text-gray-400">
            Prepare support drafts and evidence summaries. AI output never sends replies, changes cases, or files reports.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-3 py-2 text-xs text-emerald-300">
          <ShieldCheck className="h-4 w-4" /> Human approval required
        </div>
      </header>

      <div className="flex gap-2">
        <button onClick={() => { setMode("support"); setResult(null); }} className={`rounded-xl px-4 py-2 text-sm ${mode === "support" ? "bg-amber-500 font-semibold text-black" : "bg-gray-800 text-gray-300"}`}>
          <LifeBuoy className="mr-1 inline h-4 w-4" /> Support drafting
        </button>
        <button onClick={() => { setMode("compliance"); setResult(null); }} className={`rounded-xl px-4 py-2 text-sm ${mode === "compliance" ? "bg-amber-500 font-semibold text-black" : "bg-gray-800 text-gray-300"}`}>
          <FileSearch className="mr-1 inline h-4 w-4" /> Compliance summary
        </button>
      </div>

      <div className="grid gap-5 xl:grid-cols-[380px_1fr]">
        <section className="overflow-hidden rounded-2xl border border-gray-800 bg-[#0d1321]">
          <div className="border-b border-gray-800 p-4">
            <h2 className="text-sm font-semibold">{mode === "support" ? "Select a support ticket" : "Select an AML alert"}</h2>
            <p className="mt-1 text-xs text-gray-500">Only the selected record and a limited activity window are supplied to the model.</p>
          </div>
          <div className="max-h-[530px] space-y-1 overflow-y-auto p-2">
            {mode === "support" && tickets.data?.map((ticket) => (
              <button key={ticket.id} onClick={() => { setSelectedTicket(ticket.id); setResult(null); }} className={`w-full rounded-xl p-3 text-left ${selectedTicket === ticket.id ? "border border-amber-500/20 bg-amber-500/10" : "border border-transparent hover:bg-gray-800/60"}`}>
                <strong className="block truncate text-sm">#{ticket.id} · {ticket.subject}</strong>
                <span className="mt-1 block text-xs text-gray-500">{ticket.priority} · {ticket.category} · {ticket.status}</span>
              </button>
            ))}
            {mode === "compliance" && alerts.data?.map((alert) => (
              <button key={alert.id} onClick={() => { setSelectedAlert(alert.id); setResult(null); }} className={`w-full rounded-xl p-3 text-left ${selectedAlert === alert.id ? "border border-amber-500/20 bg-amber-500/10" : "border border-transparent hover:bg-gray-800/60"}`}>
                <strong className="block text-sm">Alert #{alert.id} · {alert.rule}</strong>
                <span className="mt-1 block text-xs text-gray-500">Risk {alert.riskScore} · {alert.status} · User #{alert.userId}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-gray-800 bg-[#0d1321] p-5">
          {mode === "support" && (
            <div className="mb-5 space-y-3">
              <label className="block text-xs text-gray-400" htmlFor="ai-support-instruction">Optional drafting instruction</label>
              <textarea id="ai-support-instruction" value={instruction} onChange={(event) => setInstruction(event.target.value.slice(0, 500))} rows={3} placeholder="For example: ask the customer for a redacted transaction reference." className="w-full rounded-xl border border-gray-700 bg-gray-950 p-3 text-sm outline-none focus:border-amber-500/50" />
              <button disabled={!selectedTicket || pending} onClick={() => selectedTicket && supportDraft.mutate({ ticketId: selectedTicket, tone: "empathetic", instruction: instruction || undefined })} className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-black disabled:opacity-40">
                {pending ? <Loader2 className="mr-1 inline h-4 w-4 animate-spin" /> : <Bot className="mr-1 inline h-4 w-4" />} Generate reply draft
              </button>
            </div>
          )}
          {mode === "compliance" && (
            <div className="mb-5">
              <button disabled={!selectedAlert || pending} onClick={() => selectedAlert && complianceSummary.mutate({ alertId: selectedAlert })} className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-black disabled:opacity-40">
                {pending ? <Loader2 className="mr-1 inline h-4 w-4 animate-spin" /> : <FileSearch className="mr-1 inline h-4 w-4" />} Summarize evidence
              </button>
            </div>
          )}

          {!result && !pending && (
            <div className="grid min-h-[380px] place-items-center rounded-xl border border-dashed border-gray-800">
              <div className="max-w-sm text-center">
                <Bot className="mx-auto h-9 w-9 text-gray-600" />
                <p className="mt-3 text-sm text-gray-400">Select a record and generate a read-only draft.</p>
              </div>
            </div>
          )}
          {pending && <div className="grid min-h-[380px] place-items-center"><Loader2 className="h-8 w-8 animate-spin text-amber-400" /></div>}
          {result && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">{mode === "support" ? "Suggested reply" : "Evidence summary"}</h2>
                <button onClick={() => void copyResult()} className="rounded-lg border border-gray-700 px-3 py-1.5 text-xs text-gray-300 hover:bg-gray-800"><Clipboard className="mr-1 inline h-3.5 w-3.5" /> Copy</button>
              </div>
              <div className="whitespace-pre-wrap rounded-xl border border-gray-800 bg-gray-950/60 p-4 text-sm leading-relaxed text-gray-200">{result.answer}</div>
              {!!result.insights.length && (
                <div className="grid gap-2 md:grid-cols-2">
                  {result.insights.map((insight, index) => (
                    <div key={index} className={`rounded-xl border p-3 ${insight.severity === "warning" ? "border-amber-500/20 bg-amber-500/5" : "border-blue-500/20 bg-blue-500/5"}`}>
                      <strong className="text-xs">{insight.title}</strong>
                      <p className="mt-1 text-xs text-gray-400">{insight.detail}</p>
                    </div>
                  ))}
                </div>
              )}
              <p className="rounded-lg bg-red-500/5 p-3 text-xs text-red-300">{result.disclaimer}</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
