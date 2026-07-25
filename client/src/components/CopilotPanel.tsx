import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import {
  AlertTriangle,
  Bot,
  ExternalLink,
  History,
  Plus,
  Send,
  ShieldCheck,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useI18n } from "@/contexts/I18nContext";

const quickActions = [
  { label: "Explain my portfolio risk", prompt: "Explain the main risks and concentration in my current portfolio." },
  { label: "Review allocation", prompt: "Explain my current asset allocation and any important concentration." },
  { label: "Simulate a 20% fall", prompt: "What would happen to my priced portfolio if non-stable assets fell by 20%?", shock: -20 },
  { label: "Explain recent activity", prompt: "Summarize my recent account activity and highlight anything I should review." },
];

type CopilotPanelProps = {
  variant?: "widget" | "page";
  onClose?: () => void;
};

export default function CopilotPanel({ variant = "page", onClose }: CopilotPanelProps) {
  const { language } = useI18n();
  const utils = trpc.useUtils();
  const status = trpc.ai.status.useQuery();
  const conversations = trpc.ai.conversations.useQuery();
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [input, setInput] = useState("");
  const [optimisticMessage, setOptimisticMessage] = useState("");
  const messages = trpc.ai.messages.useQuery(
    { conversationId: conversationId ?? 0 },
    { enabled: conversationId !== null },
  );
  const startConversation = trpc.ai.startConversation.useMutation();
  const feedback = trpc.ai.feedback.useMutation({
    onSuccess: () => toast.success("Thanks for the feedback"),
    onError: (error) => toast.error(error.message),
  });
  const ask = trpc.ai.ask.useMutation({
    onError: (error) => {
      setOptimisticMessage("");
      toast.error(error.message);
    },
  });
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.data, optimisticMessage, ask.isPending]);

  async function send(text = input.trim(), shock?: number) {
    if (!text || ask.isPending || !status.data?.enabled) return;
    setInput("");
    setOptimisticMessage(text);
    try {
      let activeId = conversationId;
      if (!activeId) {
        const created = await startConversation.mutateAsync({
          title: text.slice(0, 80),
          language,
        });
        activeId = created.conversationId;
        setConversationId(activeId);
      }
      await ask.mutateAsync({
        conversationId: activeId,
        message: text,
        language,
        scenarioShockPercent: shock,
      });
      setOptimisticMessage("");
      await Promise.all([
        utils.ai.messages.invalidate({ conversationId: activeId }),
        utils.ai.conversations.invalidate(),
      ]);
    } catch {
      // Mutation error handlers provide the user-facing error.
    }
  }

  const page = variant === "page";
  const shellClass = page
    ? "grid min-h-[680px] grid-cols-1 overflow-hidden rounded-3xl border border-white/10 bg-card/50 shadow-2xl lg:grid-cols-[250px_1fr]"
    : "flex h-[min(640px,calc(100vh-2rem))] w-[calc(100vw-1.5rem)] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[oklch(0.14_0.02_255)] shadow-2xl sm:w-[420px]";

  return (
    <section className={shellClass} aria-label="GoldVault AI Copilot">
      {page && (
        <aside className="border-b border-white/5 bg-black/10 p-4 lg:border-b-0 lg:border-r">
          <button
            onClick={() => setConversationId(null)}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-3 py-2.5 text-sm font-semibold text-black"
          >
            <Plus className="h-4 w-4" /> New conversation
          </button>
          <div className="mt-5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <History className="h-4 w-4" /> Recent
          </div>
          <div className="mt-2 space-y-1">
            {conversations.data?.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => setConversationId(conversation.id)}
                className={`w-full truncate rounded-lg px-3 py-2 text-left text-xs ${
                  conversationId === conversation.id
                    ? "bg-amber-500/10 text-amber-400"
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                }`}
              >
                {conversation.title}
              </button>
            ))}
          </div>
          <div className="mt-6 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-xs text-muted-foreground">
            <ShieldCheck className="mb-2 h-4 w-4 text-emerald-400" />
            Read-only. The Copilot cannot trade, transfer funds, approve cases, or access authentication secrets.
          </div>
        </aside>
      )}

      <div className="flex min-w-0 flex-col">
        <header className="flex items-center justify-between border-b border-white/5 bg-gradient-to-r from-amber-500/10 to-transparent px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-600">
              <Bot className="h-5 w-5 text-black" />
            </div>
            <div>
              <h2 className="text-sm font-semibold">GoldVault AI Copilot</h2>
              <p className="text-[11px] text-muted-foreground">
                {status.data?.enabled ? `${status.data.model} · Read-only` : "AI service not configured"}
              </p>
            </div>
          </div>
          {onClose && (
            <button aria-label="Close AI Copilot" onClick={onClose} className="rounded-lg p-2 text-muted-foreground hover:bg-white/10 hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          )}
        </header>

        {!status.isLoading && !status.data?.enabled && (
          <div role="alert" className="m-4 flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/5 p-3 text-xs text-red-300">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            Configure `OPENAI_API_KEY` on the server to enable GoldVault AI.
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4" aria-live="polite">
          {!conversationId && !optimisticMessage ? (
            <div className="mx-auto flex h-full max-w-xl flex-col items-center justify-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10">
                <Sparkles className="h-8 w-8 text-amber-400" />
              </div>
              <h3 className="mt-4 text-xl font-semibold">Understand your wealth clearly</h3>
              <p className="mt-2 max-w-md text-sm text-muted-foreground">
                Ask about your portfolio, risk, activity, platform features, or an illustrative market scenario.
              </p>
            </div>
          ) : (
            <div className="mx-auto max-w-3xl space-y-4">
              {messages.isLoading && <div className="h-28 animate-pulse rounded-2xl bg-white/5" />}
              {messages.data?.map((message) => (
                <article key={message.id} className={message.role === "user" ? "flex justify-end" : "flex justify-start"}>
                  {message.role === "user" ? (
                    <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-amber-500 px-4 py-3 text-sm text-black">
                      {message.content}
                    </div>
                  ) : (
                    <div className="max-w-[95%] space-y-3 rounded-2xl rounded-bl-sm border border-white/5 bg-white/[0.035] p-4 text-sm">
                      <p className="whitespace-pre-wrap leading-relaxed">{message.responseData?.answer ?? message.content}</p>
                      {!!message.responseData?.insights.length && (
                        <div className="grid gap-2 sm:grid-cols-2">
                          {message.responseData.insights.map((insight, index) => (
                            <div key={`${message.id}-${index}`} className={`rounded-xl border p-3 ${
                              insight.severity === "warning"
                                ? "border-amber-500/20 bg-amber-500/5"
                                : insight.severity === "positive"
                                  ? "border-emerald-500/20 bg-emerald-500/5"
                                  : "border-blue-500/20 bg-blue-500/5"
                            }`}>
                              <strong className="text-xs">{insight.title}</strong>
                              <p className="mt-1 text-xs text-muted-foreground">{insight.detail}</p>
                            </div>
                          ))}
                        </div>
                      )}
                      {!!message.responseData?.actions.length && (
                        <div className="flex flex-wrap gap-2">
                          {message.responseData.actions.map((action) => (
                            <Link key={`${message.id}-${action.href}`} href={action.href} className="rounded-lg border border-amber-500/20 px-3 py-1.5 text-xs text-amber-400 hover:bg-amber-500/10">
                              {action.label}<ExternalLink className="ml-1 inline h-3 w-3" />
                            </Link>
                          ))}
                        </div>
                      )}
                      {message.responseData?.disclaimer && (
                        <p className="border-t border-white/5 pt-2 text-[10px] text-muted-foreground">{message.responseData.disclaimer}</p>
                      )}
                      <div className="flex items-center gap-1">
                        <span className="mr-1 text-[10px] text-muted-foreground">Helpful?</span>
                        <button aria-label="Mark helpful" onClick={() => feedback.mutate({ messageId: message.id, rating: "helpful" })} className="rounded p-1 text-muted-foreground hover:bg-white/5 hover:text-emerald-400"><ThumbsUp className="h-3.5 w-3.5" /></button>
                        <button aria-label="Mark unhelpful" onClick={() => feedback.mutate({ messageId: message.id, rating: "unhelpful" })} className="rounded p-1 text-muted-foreground hover:bg-white/5 hover:text-red-400"><ThumbsDown className="h-3.5 w-3.5" /></button>
                      </div>
                    </div>
                  )}
                </article>
              ))}
              {optimisticMessage && (
                <div className="flex justify-end">
                  <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-amber-500 px-4 py-3 text-sm text-black">{optimisticMessage}</div>
                </div>
              )}
              {ask.isPending && (
                <div className="flex justify-start">
                  <div className="flex gap-1 rounded-2xl border border-white/5 bg-white/5 px-4 py-3">
                    {[0, 150, 300].map((delay) => <span key={delay} className="h-1.5 w-1.5 animate-bounce rounded-full bg-amber-500" style={{ animationDelay: `${delay}ms` }} />)}
                  </div>
                </div>
              )}
              <div ref={endRef} />
            </div>
          )}
        </div>

        <div className="border-t border-white/5 p-3">
          {!conversationId && (
            <div className="mb-3 flex flex-wrap gap-1.5">
              {quickActions.map((action) => (
                <button key={action.label} onClick={() => send(action.prompt, action.shock)} disabled={!status.data?.enabled} className="rounded-full border border-amber-500/20 px-2.5 py-1.5 text-[10px] text-amber-400 hover:bg-amber-500/10 disabled:opacity-40">
                  {action.label}
                </button>
              ))}
            </div>
          )}
          <div className="flex items-end gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
            <textarea
              aria-label="Ask GoldVault AI"
              value={input}
              onChange={(event) => setInput(event.target.value.slice(0, 2_000))}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void send();
                }
              }}
              rows={1}
              placeholder="Ask about your portfolio or GoldVaults..."
              className="max-h-28 min-h-8 flex-1 resize-none bg-transparent py-1 text-sm outline-none placeholder:text-muted-foreground"
            />
            <button aria-label="Send message" onClick={() => void send()} disabled={!input.trim() || ask.isPending || !status.data?.enabled} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500 text-black disabled:cursor-not-allowed disabled:opacity-40">
              <Send className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-2 text-center text-[9px] text-muted-foreground">
            AI may make mistakes. Verify important information. It cannot perform financial actions.
          </p>
        </div>
      </div>
    </section>
  );
}
