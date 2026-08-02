import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "wouter";
import {
  ArrowLeft,
  Coins,
  Loader2,
  MessageCircle,
  MessagesSquare,
  RefreshCw,
  Search,
  Send,
  Share2,
  ShieldCheck,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import {
  useChatHistory,
  useCommunityFeed,
  useCreatePost,
  useSendMessage,
  useSocialContacts,
} from "@/hooks/useGoldVaults";
import SocialCallControls from "@/components/SocialCallControls";

function initials(name: string | null, username: string | null): string {
  const source = name?.trim() || username?.trim() || "GoldVault Member";
  return source.split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("");
}

function timeAgo(value: Date | string | null): string {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  const elapsed = Date.now() - date.getTime();
  if (!Number.isFinite(elapsed) || elapsed < 0) return "Recently";
  const minutes = Math.floor(elapsed / 60_000);
  if (minutes < 1) return "Now";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

export default function SocialHub() {
  const { user } = useAuth();
  const [view, setView] = useState<"messages" | "feed">(user ? "messages" : "feed");
  const [contactSearch, setContactSearch] = useState("");
  const [selectedId, setSelectedId] = useState<number | undefined>();
  const initializedSelection = useRef(false);
  const [message, setMessage] = useState("");
  const contactsQuery = useSocialContacts(Boolean(user));
  const contacts = Array.isArray(contactsQuery.data) ? contactsQuery.data : [];
  const filteredContacts = contacts.filter((contact) =>
    `${contact.name ?? ""} ${contact.username ?? ""}`.toLowerCase().includes(contactSearch.trim().toLowerCase()),
  );
  const selectedContact = contacts.find((contact) => contact.id === selectedId);
  const history = useChatHistory(selectedContact?.id);
  const sendMessage = useSendMessage();
  const markRead = trpc.social.markRead.useMutation();
  const utils = trpc.useUtils();

  useEffect(() => {
    if (!initializedSelection.current && contacts[0]) {
      initializedSelection.current = true;
      setSelectedId(contacts[0].id);
    }
  }, [contacts]);

  useEffect(() => {
    if (!selectedContact || view !== "messages") return;
    void markRead.mutateAsync({ otherUserId: selectedContact.id }).then(() => {
      void utils.social.contacts.invalidate();
    }).catch(() => undefined);
  }, [selectedContact?.id, view]);

  const socialStats = useMemo(() => ({
    online: contacts.filter((contact) => contact.isOnline).length,
    unread: contacts.reduce((total, contact) => total + contact.unreadCount, 0),
    shares: 0,
  }), [contacts]);

  const sendChat = async () => {
    const content = message.trim();
    if (!selectedContact || !content || sendMessage.isPending) return;
    try {
      await sendMessage.mutateAsync({ toUserId: selectedContact.id, content, mediaType: "text" });
      setMessage("");
    } catch {
      // The shared mutation hook displays the API error.
    }
  };

  return (
    <section className="space-y-6 py-4" aria-labelledby="social-hub-heading">
      <div className="text-center">
        <h2 id="social-hub-heading" className="text-3xl font-black text-white">Social Hub</h2>
        <p className="mt-2 text-sm text-slate-400">Connect with GoldVaults members, exchange messages, share insights, and call securely.</p>
        <div className="mt-5 inline-flex rounded-xl border border-white/10 bg-slate-950/60 p-1">
          <button type="button" onClick={() => setView("messages")} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm ${view === "messages" ? "bg-blue-600 text-white" : "text-slate-400"}`}><MessagesSquare className="h-4 w-4" /> Messages</button>
          <button type="button" onClick={() => setView("feed")} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm ${view === "feed" ? "bg-blue-600 text-white" : "text-slate-400"}`}><Users className="h-4 w-4" /> Community feed</button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Members online", value: socialStats.online, icon: Users, color: "text-emerald-400" },
          { label: "Unread messages", value: socialStats.unread, icon: MessageCircle, color: "text-amber-400" },
          { label: "Community contacts", value: contacts.length, icon: Share2, color: "text-blue-400" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-2xl border border-blue-500/30 bg-blue-950/50 p-5 text-center">
            <Icon className={`mx-auto h-5 w-5 ${color}`} />
            <p className="mt-3 text-2xl font-black text-white">{value.toLocaleString()}</p>
            <p className="text-xs text-slate-400">{label}</p>
          </div>
        ))}
      </div>

      {view === "messages" ? (
        user ? (
          <div className="grid min-h-[38rem] overflow-hidden rounded-2xl border border-blue-500/30 bg-blue-950/35 lg:grid-cols-[20rem_1fr]">
            <aside className={`${selectedContact ? "hidden lg:flex" : "flex"} min-h-0 flex-col border-blue-500/30 lg:border-r`}>
              <div className="border-b border-blue-500/30 p-4">
                <label className="relative block">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input value={contactSearch} onChange={(event) => setContactSearch(event.target.value)} placeholder="Search members…" className="w-full rounded-xl border border-blue-500/30 bg-blue-950/60 py-2.5 pl-10 pr-3 text-sm text-white outline-none focus:border-amber-500/50" />
                </label>
              </div>
              <div className="flex-1 overflow-y-auto">
                {contactsQuery.isLoading ? <div className="flex justify-center p-10"><Loader2 className="h-5 w-5 animate-spin text-blue-400" /></div> : filteredContacts.length === 0 ? <p className="p-8 text-center text-sm text-slate-500">No members found.</p> : filteredContacts.map((contact) => (
                  <button key={contact.id} type="button" onClick={() => setSelectedId(contact.id)} className={`flex w-full items-center gap-3 border-b border-blue-500/10 p-4 text-left transition ${selectedId === contact.id ? "border-l-2 border-l-amber-400 bg-blue-800/60" : "hover:bg-blue-900/40"}`}>
                    <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-amber-400 to-orange-600 text-xs font-black text-slate-950">
                      {contact.avatarUrl ? <img src={contact.avatarUrl} alt="" className="h-full w-full object-cover" /> : initials(contact.name, contact.username)}
                      <span className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-blue-950 ${contact.isOnline ? "bg-emerald-400" : "bg-slate-500"}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2"><span className="truncate text-sm font-semibold text-white">{contact.name || contact.username || "GoldVault Member"}</span><span className="text-[10px] text-slate-500">{timeAgo(contact.lastMessageAt || contact.lastSignedIn)}</span></div>
                      <p className="truncate text-xs text-slate-400">{contact.lastMessage || (contact.isOnline ? "Online now" : `@${contact.username || "member"}`)}</p>
                      <p className="mt-1 text-[10px] font-semibold text-amber-400"><Coins className="mr-1 inline h-3 w-3" />{contact.goldCoins.toLocaleString()} GoldCoins</p>
                    </div>
                    {contact.unreadCount > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-amber-500 px-1 text-[10px] font-bold text-slate-950">{contact.unreadCount}</span>}
                  </button>
                ))}
              </div>
            </aside>

            <div className={`${selectedContact ? "flex" : "hidden lg:flex"} min-w-0 flex-col`}>
              {selectedContact ? (
                <>
                  <header className="flex items-center gap-3 border-b border-blue-500/30 p-4">
                    <button type="button" aria-label="Back to contacts" onClick={() => setSelectedId(undefined)} className="rounded-lg p-2 text-slate-400 lg:hidden"><ArrowLeft className="h-4 w-4" /></button>
                    <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-amber-500 text-xs font-black text-slate-950">{selectedContact.avatarUrl ? <img src={selectedContact.avatarUrl} alt="" className="h-full w-full object-cover" /> : initials(selectedContact.name, selectedContact.username)}</div>
                    <div className="min-w-0 flex-1"><p className="truncate font-semibold text-white">{selectedContact.name || selectedContact.username || "GoldVault Member"}</p><p className="text-xs text-slate-400">{selectedContact.isOnline ? "Online" : `Last active ${timeAgo(selectedContact.lastSignedIn)} ago`} · {selectedContact.tier} member</p></div>
                    <SocialCallControls contact={selectedContact} contacts={contacts} />
                  </header>
                  <div className="flex flex-1 flex-col-reverse gap-3 overflow-y-auto p-4 sm:p-6">
                    <div className="flex flex-col gap-3">
                      {history.isLoading ? <div className="flex justify-center p-10"><Loader2 className="h-5 w-5 animate-spin text-blue-400" /></div> : history.data?.length ? history.data.map((entry) => {
                        const mine = entry.fromUserId === user.id;
                        return <div key={entry.id} className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${mine ? "ml-auto rounded-br-md bg-amber-500 text-slate-950" : "mr-auto rounded-bl-md bg-blue-800 text-white"}`}><p className="whitespace-pre-wrap">{entry.content}</p><p className={`mt-1 text-[10px] ${mine ? "text-amber-950/60" : "text-blue-200/60"}`}>{new Date(entry.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p></div>;
                      }) : <div className="grid flex-1 place-items-center py-24 text-center"><MessageCircle className="mx-auto h-10 w-10 text-blue-400/50" /><p className="mt-3 font-semibold text-white">Start a conversation</p><p className="text-sm text-slate-500">Messages are stored securely in your GoldVaults account.</p></div>}
                    </div>
                  </div>
                  <div className="border-t border-blue-500/30 p-4">
                    <div className="flex items-center gap-3">
                      <input value={message} onChange={(event) => setMessage(event.target.value.slice(0, 2_000))} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void sendChat(); } }} placeholder={`Message ${selectedContact.name || selectedContact.username || "member"}…`} className="min-w-0 flex-1 rounded-xl border border-blue-500/30 bg-blue-950/60 px-4 py-3 text-sm text-white outline-none focus:border-amber-500/50" />
                      <button type="button" aria-label="Send message" disabled={!message.trim() || sendMessage.isPending} onClick={() => void sendChat()} className="rounded-xl bg-amber-500 p-3 text-slate-950 disabled:opacity-40">{sendMessage.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}</button>
                    </div>
                  </div>
                </>
              ) : <div className="grid flex-1 place-items-center text-sm text-slate-500">Select a member to start messaging.</div>}
            </div>
          </div>
        ) : (
          <SignInCard />
        )
      ) : (
        <CommunityFeed user={user} />
      )}
    </section>
  );
}

function SignInCard() {
  return <div className="flex flex-col gap-3 rounded-2xl border border-blue-500/20 bg-blue-500/10 p-6 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-semibold text-white">Sign in to message and call members</p><p className="text-sm text-slate-400">Community posts remain publicly readable.</p></div><button type="button" onClick={() => { window.location.href = getLoginUrl("/social"); }} className="rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-bold text-slate-950">Sign in</button></div>;
}

function CommunityFeed({ user }: { user: ReturnType<typeof useAuth>["user"] }) {
  const [content, setContent] = useState("");
  const feed = useCommunityFeed(30);
  const createPost = useCreatePost();
  const posts = Array.isArray(feed.data) ? feed.data : [];

  const publish = async () => {
    const post = content.trim();
    if (!post || createPost.isPending) return;
    try {
      await createPost.mutateAsync({ content: post, mediaType: "none", platform: "goldvaults" });
      setContent("");
    } catch {
      // The shared mutation hook displays the API error.
    }
  };
  const sharePost = async (postId: number, text: string | null) => {
    const url = `${window.location.origin}/social#post-${postId}`;
    try {
      if (navigator.share) await navigator.share({ title: "GoldVaults Social Hub", text: text ?? undefined, url });
      else { await navigator.clipboard.writeText(url); toast.success("Post link copied"); }
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError")) toast.error("Unable to share this post");
    }
  };

  return <div className="space-y-4">
    {user ? <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4"><div className="flex gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500 text-sm font-black text-slate-950">{initials(user.name, user.username)}</div><div className="min-w-0 flex-1"><textarea value={content} onChange={(event) => setContent(event.target.value.slice(0, 2_000))} rows={3} placeholder="Share a useful gold or crypto market insight…" className="w-full resize-none rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none focus:border-amber-500/50"/><div className="mt-2 flex flex-wrap items-center justify-between gap-3"><p className="flex items-center gap-1.5 text-xs text-slate-400"><ShieldCheck className="h-3.5 w-3.5" /> No guaranteed-return claims or personal information.</p><button type="button" onClick={() => void publish()} disabled={!content.trim() || createPost.isPending} className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-sm font-bold text-slate-950 disabled:opacity-50">{createPost.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Publish</button></div></div></div></div> : <SignInCard />}
    <div className="rounded-2xl border border-white/10 bg-slate-950/60"><div className="flex items-center justify-between border-b border-white/10 px-5 py-4"><div><h3 className="font-bold text-white">Community feed</h3><p className="text-xs text-slate-500">Real posts from GoldVaults members</p></div><button type="button" onClick={() => feed.refetch()} disabled={feed.isFetching} className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-300"><RefreshCw className={`h-3.5 w-3.5 ${feed.isFetching ? "animate-spin" : ""}`} /> Refresh</button></div>
      {feed.isLoading ? <div className="flex justify-center p-12"><Loader2 className="h-5 w-5 animate-spin text-blue-400" /></div> : feed.error ? <div className="p-8 text-center text-sm text-red-300">{feed.error.message}</div> : posts.length === 0 ? <div className="p-12 text-center"><MessageCircle className="mx-auto h-8 w-8 text-slate-600"/><p className="mt-3 font-semibold text-white">No community posts yet</p></div> : <div className="divide-y divide-white/10">{posts.map((post) => <article id={`post-${post.id}`} key={post.id} className="p-5"><div className="flex items-start gap-3">{post.authorAvatar ? <img src={post.authorAvatar} alt="" className="h-10 w-10 rounded-full object-cover" /> : <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-amber-300">{initials(post.authorName, post.authorUsername)}</div>}<div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><span className="font-semibold text-white">{post.authorName || "GoldVault Member"}</span>{post.authorUsername && <span className="text-xs text-amber-400">@{post.authorUsername}</span>}<span className="text-xs text-slate-500">{timeAgo(post.createdAt)}</span></div>{post.content && <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-300">{post.content}</p>}{post.mediaType === "image" && post.mediaUrl && <img src={post.mediaUrl} alt="Community attachment" className="mt-3 max-h-80 rounded-xl object-cover"/>}<div className="mt-3 flex items-center gap-4 text-xs text-slate-500"><span>{Number(post.likes || 0).toLocaleString()} likes</span><span>{Number(post.shares || 0).toLocaleString()} shares</span><button type="button" onClick={() => void sharePost(post.id, post.content)} className="ml-auto inline-flex items-center gap-1.5 hover:text-amber-400"><Share2 className="h-3.5 w-3.5"/> Share</button></div></div></div></article>)}</div>}
    </div>
    <Link href="/dashboard/referral" className="inline-flex items-center gap-2 text-sm font-semibold text-amber-400"><Users className="h-4 w-4" /> Invite members to GoldVaults</Link>
  </div>;
}
