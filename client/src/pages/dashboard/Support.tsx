/**
 * Support — Help center, tickets, live chat, FAQ
 */
import { useState } from "react";
import UserDashboardLayout from "@/components/UserDashboardLayout";
import { motion } from "framer-motion";
import { HeadphonesIcon, MessageSquare, FileText, Search, ChevronDown, ChevronRight, Mail, Phone } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

const faqItems = [
  { q: "How do I deposit funds?", a: "Navigate to the Deposit page, select your currency, and send funds to the displayed address. Deposits are credited after the required network confirmations." },
  { q: "How long do withdrawals take?", a: "Withdrawal processing times vary: Crypto withdrawals take 1-4 hours, bank transfers take 1-3 business days, and mobile money is instant." },
  { q: "What are GoldCoins?", a: "GoldCoins are our loyalty rewards. Earn them through trading, referrals, and completing challenges. Redeem for fee discounts, premium features, and more." },
  { q: "How do I verify my identity (KYC)?", a: "Go to Settings > Security, click 'Verify Identity', and upload a government-issued ID plus a selfie. Verification typically takes 24-48 hours." },
  { q: "What are the trading fees?", a: "Standard trading fees are 0.1% maker / 0.15% taker. Gold members get 50% off, and Platinum members trade fee-free." },
  { q: "Is my money safe?", a: "Yes. We use bank-grade encryption, cold storage for 95% of assets, multi-signature wallets, and are fully insured against hacks up to $100M." },
];

export default function Support() {
  return (
    <UserDashboardLayout>
      <SupportContent />
    </UserDashboardLayout>
  );
}

function SupportContent() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketMessage, setTicketMessage] = useState("");
  const [ticketAttachment, setTicketAttachment] = useState<File | null>(null);
  const [activeTicket, setActiveTicket] = useState<number | null>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const utils = trpc.useUtils();
  const tickets = trpc.advanced.support.list.useQuery();
  const ticketMessages = trpc.advanced.support.messages.useQuery({ ticketId: activeTicket! }, { enabled: activeTicket !== null });
  const replyTicket = trpc.advanced.support.reply.useMutation({ onSuccess: async () => { setReplyMessage(""); await ticketMessages.refetch(); await tickets.refetch(); } });
  const createTicket = trpc.advanced.support.create.useMutation({
    onSuccess: async (data) => {
      await utils.advanced.support.list.invalidate();
      toast.success(`Support ticket #${data.ticketId} submitted`);
      setTicketSubject(""); setTicketMessage("");
      setTicketAttachment(null);
    },
    onError: (error) => toast.error(error.message),
  });

  const handleSubmitTicket = async () => {
    if (!ticketSubject || !ticketMessage) {
      toast.error("Please fill in all fields");
      return;
    }
    let attachmentUrl: string | undefined;
    if (ticketAttachment) {
      const form = new FormData(); form.append("file", ticketAttachment);
      const response = await fetch("/api/upload", { method: "POST", body: form });
      if (!response.ok) return toast.error("Attachment upload failed");
      attachmentUrl = (await response.json() as { url: string }).url;
    }
    createTicket.mutate({ subject: ticketSubject, message: ticketMessage, category: "general", priority: "normal", attachmentUrl });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-foreground">Help & Support</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Get help with your account, trades, and more</p>
      </div>

      {/* Quick Contact */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => toast.info("Live chat connecting...")}
          className="bg-card/50 border border-white/5 rounded-2xl p-4 hover:border-amber-500/20 transition-colors text-left"
        >
          <MessageSquare className="w-5 h-5 text-amber-500 mb-2" />
          <p className="text-sm font-semibold text-foreground">Live Chat</p>
          <p className="text-xs text-muted-foreground mt-0.5">Available 24/7</p>
        </motion.button>
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          onClick={() => toast.info("Email: support@goldvaults.us")}
          className="bg-card/50 border border-white/5 rounded-2xl p-4 hover:border-amber-500/20 transition-colors text-left"
        >
          <Mail className="w-5 h-5 text-blue-400 mb-2" />
          <p className="text-sm font-semibold text-foreground">Email Support</p>
          <p className="text-xs text-muted-foreground mt-0.5">support@goldvaults.us</p>
        </motion.button>
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onClick={() => toast.info("Phone: +1 (800) GOLD-VLT")}
          className="bg-card/50 border border-white/5 rounded-2xl p-4 hover:border-amber-500/20 transition-colors text-left"
        >
          <Phone className="w-5 h-5 text-emerald-400 mb-2" />
          <p className="text-sm font-semibold text-foreground">Phone Support</p>
          <p className="text-xs text-muted-foreground mt-0.5">Mon-Fri 9AM-6PM EST</p>
        </motion.button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* FAQ */}
        <div className="bg-card/50 border border-white/5 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-amber-500" />
            <h3 className="text-sm font-semibold text-foreground">Frequently Asked Questions</h3>
          </div>
          <div className="space-y-2">
            {faqItems.map((item, i) => (
              <div key={i} className="border border-white/5 rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-white/5 transition-colors"
                >
                  <span className="text-xs font-medium text-foreground">{item.q}</span>
                  <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${openFaq === i ? "rotate-180" : ""}`} />
                </button>
                {openFaq === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    className="px-4 pb-3"
                  >
                    <p className="text-xs text-muted-foreground leading-relaxed">{item.a}</p>
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Submit Ticket */}
        <div className="bg-card/50 border border-white/5 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <HeadphonesIcon className="w-5 h-5 text-amber-500" />
            <h3 className="text-sm font-semibold text-foreground">Submit a Ticket</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Subject</label>
              <input
                value={ticketSubject}
                onChange={(e) => setTicketSubject(e.target.value)}
                placeholder="Brief description of your issue"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Attachment (optional)</label>
              <input aria-label="Support ticket attachment" type="file" accept="image/*,.pdf,.txt" onChange={(event)=>setTicketAttachment(event.target.files?.[0]??null)} className="w-full text-xs text-muted-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-white/10 file:px-3 file:py-2 file:text-foreground"/>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Message</label>
              <textarea
                value={ticketMessage}
                onChange={(e) => setTicketMessage(e.target.value)}
                placeholder="Describe your issue in detail..."
                rows={5}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-none"
              />
            </div>
            <button
              onClick={handleSubmitTicket}
              className="w-full py-2.5 bg-amber-500 text-black font-semibold rounded-xl hover:bg-amber-400 transition-colors text-sm"
            >
              Submit Ticket
            </button>
          </div>
        </div>
      </div>
      <section className="bg-card/50 border border-white/5 rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">Your tickets</h3>
        {tickets.isLoading ? <div className="h-28 animate-pulse rounded-xl bg-white/5" /> : tickets.data?.length ? <div className="space-y-2">{tickets.data.map((ticket) => <button onClick={()=>setActiveTicket(ticket.id)} key={ticket.id} className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl bg-white/5 p-3 text-left"><div><strong className="text-sm">#{ticket.id} · {ticket.subject}</strong><p className="text-xs text-muted-foreground">{ticket.category} · updated {new Date(ticket.updatedAt).toLocaleString()}</p></div><span className="rounded-full bg-amber-500/10 text-amber-400 px-3 py-1 text-xs">{ticket.status.replace("_", " ")}</span></button>)}</div> : <p className="text-sm text-muted-foreground">No tickets submitted yet.</p>}
      </section>
      {activeTicket!==null&&<section className="bg-card/50 border border-white/5 rounded-2xl p-5"><div className="flex justify-between"><h3 className="font-semibold">Ticket #{activeTicket}</h3><button aria-label="Close ticket conversation" onClick={()=>setActiveTicket(null)}>×</button></div><div className="my-4 max-h-72 overflow-y-auto space-y-2">{ticketMessages.data?.map((entry)=><div key={entry.id} className={`rounded-xl p-3 text-sm ${entry.senderAdminId?"bg-blue-500/10 ml-4":"bg-white/5 mr-4"}`}>{entry.body}<p className="text-[10px] text-muted-foreground mt-1">{entry.senderAdminId?"GoldVaults Support":"You"} · {new Date(entry.createdAt).toLocaleString()}</p></div>)}</div><div className="flex gap-2"><input aria-label="Ticket reply" value={replyMessage} onChange={(e)=>setReplyMessage(e.target.value)} className="flex-1 rounded-xl bg-background border border-white/10 px-3"/><button disabled={!replyMessage} onClick={()=>replyTicket.mutate({ticketId:activeTicket,message:replyMessage})} className="rounded-xl bg-amber-500 text-black px-4 py-2">Reply</button></div></section>}
    </div>
  );
}
