import { useState } from "react";
import UserDashboardLayout from "@/components/UserDashboardLayout";
import { trpc } from "@/lib/trpc";
import { CreditCard, Lock, Shield, Snowflake, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";

export default function Cards() {
  return <UserDashboardLayout><CardsContent /></UserDashboardLayout>;
}

function CardsContent() {
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const cards = trpc.nfcCard.list.useQuery();
  const [cardType, setCardType] = useState<"virtual" | "physical">("virtual");
  const [pin, setPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const refresh = () => utils.nfcCard.list.invalidate();
  const create = trpc.nfcCard.create.useMutation({
    onSuccess: async (data) => {
      await refresh();
      setPin("");
      toast.success(data.status === "pending" ? "Physical card request submitted" : "Virtual card issued");
    },
    onError: (error) => toast.error(error.message),
  });
  const freeze = trpc.nfcCard.toggleFreeze.useMutation({ onSuccess: refresh, onError: (error) => toast.error(error.message) });
  const limits = trpc.nfcCard.updateLimits.useMutation({ onSuccess: refresh, onError: (error) => toast.error(error.message) });
  const changePin = trpc.nfcCard.changePin.useMutation({
    onSuccess: () => {
      setNewPin("");
      setTwoFactorCode("");
      toast.success("Card PIN updated");
    },
    onError: (error) => toast.error(error.message),
  });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">GoldVault Cards</h1>
        <p className="text-sm text-muted-foreground">Verified users can issue and control wallet-linked virtual and physical cards.</p>
      </header>
      {user?.kycStatus !== "verified" && (
        <div role="alert" className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-300">
          <Shield className="inline w-4 h-4 mr-2" />Complete identity verification before requesting a card.
        </div>
      )}
      <section className="grid grid-cols-1 sm:grid-cols-4 gap-3 rounded-2xl border border-white/5 bg-card/50 p-4">
        <select aria-label="Card type" value={cardType} onChange={(event) => setCardType(event.target.value as typeof cardType)} className="rounded-xl bg-background border border-white/10 p-2">
          <option value="virtual">Virtual card</option><option value="physical">Physical card</option>
        </select>
        <input aria-label="New four digit card PIN" type="password" inputMode="numeric" maxLength={4} value={pin} onChange={(event) => setPin(event.target.value.replace(/\D/g, ""))} placeholder="4-digit PIN" className="rounded-xl bg-background border border-white/10 p-2" />
        <button disabled={user?.kycStatus !== "verified" || pin.length !== 4 || create.isPending} onClick={() => create.mutate({ cardholderName: user?.name ?? "GoldVaults Member", cardType, pin })} className="sm:col-span-2 rounded-xl bg-amber-500 text-black font-semibold disabled:opacity-50">Request {cardType} card</button>
      </section>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {cards.isLoading ? [1, 2].map((id) => <div key={id} className="h-56 animate-pulse bg-white/5 rounded-2xl" />) : cards.data?.map((card) => (
          <article key={card.id} className="rounded-2xl border border-white/5 bg-card/50 p-5">
            <div className={`relative h-44 rounded-2xl p-5 ${card.isFrozen ? "bg-slate-700" : "bg-gradient-to-br from-amber-500 to-amber-700"} text-white`}>
              <div className="flex justify-between"><span className="font-bold">GOLDVAULT</span><CreditCard /></div>
              <p className="font-mono text-lg tracking-wider mt-10">{card.cardNumber}</p>
              <div className="flex justify-between mt-4 text-xs"><span>{card.cardholderName.toUpperCase()}</span><span>{String(card.expiryMonth).padStart(2, "0")}/{String(card.expiryYear).slice(-2)}</span></div>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              <button onClick={() => freeze.mutate({ id: card.id, frozen: !card.isFrozen })} className="rounded-lg border border-white/10 px-3 py-2 text-xs"><Snowflake className="inline w-3 h-3 mr-1" />{card.isFrozen ? "Unfreeze" : "Freeze"}</button>
              <button onClick={() => limits.mutate({ id: card.id, dailyLimit: "2000", monthlyLimit: "20000" })} className="rounded-lg border border-white/10 px-3 py-2 text-xs"><SlidersHorizontal className="inline w-3 h-3 mr-1" />Set limits</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-2 mt-3">
              <input aria-label="Replacement four digit PIN" value={newPin} onChange={(event) => setNewPin(event.target.value.replace(/\D/g, ""))} maxLength={4} type="password" inputMode="numeric" placeholder="New PIN" className="min-w-0 rounded-lg bg-background border border-white/10 px-3 py-2" />
              <input aria-label="Two-factor code for PIN change" value={twoFactorCode} onChange={(event) => setTwoFactorCode(event.target.value.trim())} autoComplete="one-time-code" placeholder="2FA code if enabled" className="min-w-0 rounded-lg bg-background border border-white/10 px-3 py-2" />
              <button disabled={newPin.length !== 4 || changePin.isPending} onClick={() => changePin.mutate({ id: card.id, pin: newPin, twoFactorCode: twoFactorCode || undefined })} className="rounded-lg bg-white/10 px-3 py-2 text-xs disabled:opacity-50"><Lock className="inline w-3 h-3 mr-1" />Change PIN</button>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">Status: {card.issuanceStatus} · Daily limit ${card.dailyLimit} · Monthly limit ${card.monthlyLimit}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
