import { useState } from "react";
import UserDashboardLayout from "@/components/UserDashboardLayout";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { MessageSquare, Plus, Scale, ShieldCheck } from "lucide-react";

export default function P2PMarketplace() {
  return <UserDashboardLayout><P2PContent /></UserDashboardLayout>;
}

function P2PContent() {
  const utils = trpc.useUtils();
  const [showCreate, setShowCreate] = useState(false);
  const [side, setSide] = useState<"buy" | "sell">("sell");
  const [asset, setAsset] = useState("USDT");
  const [amount, setAmount] = useState("100");
  const [price, setPrice] = useState("1");
  const [activeOrder, setActiveOrder] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const offers = trpc.advanced.p2p.offers.useQuery({});
  const orders = trpc.advanced.p2p.myOrders.useQuery();
  const messages = trpc.advanced.p2p.messages.useQuery({ orderId: activeOrder! }, { enabled: activeOrder !== null, refetchInterval: 5_000 });
  const refresh = () => Promise.all([utils.advanced.p2p.offers.invalidate(), utils.advanced.p2p.myOrders.invalidate()]);
  const create = trpc.advanced.p2p.createOffer.useMutation({ onSuccess: async () => { await refresh(); setShowCreate(false); toast.success("Offer published"); }, onError: (error) => toast.error(error.message) });
  const open = trpc.advanced.p2p.openOrder.useMutation({ onSuccess: async (data) => { await refresh(); setActiveOrder(data.orderId); toast.success("Funds secured in escrow"); }, onError: (error) => toast.error(error.message) });
  const paid = trpc.advanced.p2p.markPaid.useMutation({ onSuccess: refresh });
  const release = trpc.advanced.p2p.release.useMutation({ onSuccess: async () => { await refresh(); toast.success("Escrow released"); } });
  const send = trpc.advanced.p2p.sendMessage.useMutation({ onSuccess: async () => { setMessage(""); await messages.refetch(); } });
  const dispute = trpc.advanced.p2p.dispute.useMutation({ onSuccess: async () => { await refresh(); toast.success("Dispute opened for compliance review"); } });

  return <div className="space-y-6">
    <header className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
      <div><h1 className="text-2xl font-bold">P2P Marketplace</h1><p className="text-sm text-muted-foreground">Trade directly with escrow protection and dispute support.</p></div>
      <button onClick={() => setShowCreate(!showCreate)} className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-black"><Plus className="inline w-4 h-4 mr-1" />Create offer</button>
    </header>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {[{ icon: ShieldCheck, title: "Atomic escrow", text: "Seller assets are reserved when an order opens." }, { icon: MessageSquare, title: "Trade chat", text: "Keep payment evidence and discussion with the order." }, { icon: Scale, title: "Dispute resolution", text: "Admins can release or refund escrow after review." }].map((item) => <div key={item.title} className="rounded-2xl border border-white/5 bg-card/50 p-4"><item.icon className="w-5 h-5 text-amber-500" /><h2 className="mt-2 text-sm font-semibold">{item.title}</h2><p className="text-xs text-muted-foreground">{item.text}</p></div>)}
    </div>
    {showCreate && <section className="rounded-2xl border border-amber-500/20 bg-card p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      <select aria-label="Offer side" value={side} onChange={(event) => setSide(event.target.value as typeof side)} className="rounded-xl border border-white/10 bg-background p-2"><option value="sell">Sell</option><option value="buy">Buy</option></select>
      <input aria-label="Asset" value={asset} onChange={(event) => setAsset(event.target.value.toUpperCase())} className="rounded-xl border border-white/10 bg-background p-2" />
      <input aria-label="Available amount" type="number" value={amount} onChange={(event) => setAmount(event.target.value)} className="rounded-xl border border-white/10 bg-background p-2" />
      <input aria-label="Unit price in USD" type="number" value={price} onChange={(event) => setPrice(event.target.value)} className="rounded-xl border border-white/10 bg-background p-2" />
      <button onClick={() => create.mutate({ side, asset, fiatCurrency: "USD", price, minAmount: "10", maxAmount: amount, availableAmount: amount, paymentMethods: ["Bank transfer"], terms: "Payment must be completed within 30 minutes." })} className="sm:col-span-2 lg:col-span-4 rounded-xl bg-amber-500 p-2 font-semibold text-black">Publish offer</button>
    </section>}
    <section className="rounded-2xl border border-white/5 bg-card/50 overflow-hidden">
      <div className="p-4 border-b border-white/5"><h2 className="font-semibold">Open offers</h2></div>
      {offers.isLoading ? <div className="h-40 animate-pulse bg-white/5" /> : offers.data?.length ? <div className="divide-y divide-white/5">{offers.data.map((offer) => <div key={offer.id} className="grid grid-cols-2 md:grid-cols-6 gap-3 p-4 items-center text-sm"><span className={offer.side === "sell" ? "text-red-400" : "text-emerald-400"}>{offer.side.toUpperCase()}</span><strong>{offer.asset}</strong><span>{offer.price} {offer.fiatCurrency}</span><span>{offer.minAmount}–{offer.maxAmount}</span><span className="text-muted-foreground">{offer.paymentMethods.join(", ")}</span><button onClick={() => open.mutate({ offerId: offer.id, amount: offer.minAmount })} className="rounded-lg bg-white/10 px-3 py-2 hover:bg-amber-500 hover:text-black">Trade</button></div>)}</div> : <p className="p-8 text-center text-muted-foreground">No active offers yet.</p>}
    </section>
    <section className="rounded-2xl border border-white/5 bg-card/50 p-4"><h2 className="font-semibold mb-3">My orders</h2><div className="space-y-2">{orders.data?.map((order) => <div key={order.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl bg-white/5 p-3 text-sm"><div><strong>#{order.id} · {order.amount} {order.asset}</strong><p className="text-xs text-muted-foreground">{order.status} · {order.fiatAmount} {order.fiatCurrency}</p></div><div className="flex flex-wrap gap-2"><button onClick={() => setActiveOrder(order.id)} className="rounded-lg border border-white/10 px-3 py-1.5">Chat</button>{order.status === "escrowed" && <button onClick={() => paid.mutate({ orderId: order.id, paymentReference: `PAY-${Date.now()}` })} className="rounded-lg bg-blue-500/20 text-blue-300 px-3 py-1.5">Mark paid</button>}{order.status === "paid" && <button onClick={() => release.mutate({ orderId: order.id })} className="rounded-lg bg-emerald-500/20 text-emerald-300 px-3 py-1.5">Release escrow</button>}{["escrowed", "paid"].includes(order.status) && <button onClick={() => dispute.mutate({ orderId: order.id, reason: "Payment or settlement requires compliance review." })} className="rounded-lg bg-red-500/10 text-red-400 px-3 py-1.5">Dispute</button>}</div></div>)}</div></section>
    {activeOrder !== null && <section className="rounded-2xl border border-white/10 bg-card p-4"><div className="flex justify-between"><h2 className="font-semibold">Trade chat · Order #{activeOrder}</h2><button aria-label="Close chat" onClick={() => setActiveOrder(null)}>×</button></div><div className="my-3 h-44 overflow-y-auto space-y-2">{messages.data?.map((entry) => <div key={entry.id} className="rounded-lg bg-white/5 p-2 text-sm">{entry.body}<p className="text-[10px] text-muted-foreground">{new Date(entry.createdAt).toLocaleString()}</p></div>)}</div><div className="flex gap-2"><input aria-label="Trade message" value={message} onChange={(event) => setMessage(event.target.value)} className="flex-1 rounded-xl border border-white/10 bg-background px-3" /><button onClick={() => message && send.mutate({ orderId: activeOrder, body: message })} className="rounded-xl bg-amber-500 px-4 py-2 text-black">Send</button></div></section>}
  </div>;
}
