import { useMemo, useState } from "react";
import { Link } from "wouter";
import {
  Coins,
  Loader2,
  MessageCircle,
  RefreshCw,
  Send,
  Share2,
  ShieldCheck,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { useCommunityFeed, useCreatePost } from "@/hooks/useGoldVaults";

function initials(name: string | null, username: string | null): string {
  const source = name?.trim() || username?.trim() || "GoldVault Member";
  return source
    .split(/\s+/)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase())
    .join("");
}

function timeAgo(value: Date | string): string {
  const date = value instanceof Date ? value : new Date(value);
  const elapsed = Date.now() - date.getTime();
  if (!Number.isFinite(elapsed) || elapsed < 0) return "Recently";
  const minutes = Math.floor(elapsed / 60_000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function SocialHub() {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const feed = useCommunityFeed(30);
  const createPost = useCreatePost();
  const posts = Array.isArray(feed.data) ? feed.data : [];

  const stats = useMemo(() => ({
    members: new Set(posts.map(post => post.authorUsername || post.authorName || post.id)).size,
    posts: posts.length,
    rewards: posts.reduce((sum, post) => sum + Number(post.goldCoinsEarned || 0), 0),
  }), [posts]);

  const publish = async () => {
    const message = content.trim();
    if (!message || createPost.isPending) return;
    try {
      await createPost.mutateAsync({
        content: message,
        mediaType: "none",
        platform: "goldvaults",
      });
      setContent("");
    } catch {
      // The shared mutation hook displays the API error.
    }
  };

  const sharePost = async (postId: number, text: string | null) => {
    const url = `${window.location.origin}/social#post-${postId}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "GoldVaults Social Hub", text: text ?? undefined, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Post link copied");
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      toast.error("Unable to share this post");
    }
  };

  return (
    <section className="space-y-6 py-6" aria-labelledby="social-hub-heading">
      <div className="flex flex-col gap-4 rounded-3xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 via-slate-900 to-slate-950 p-6 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400" /> Live community feed
          </div>
          <h2 id="social-hub-heading" className="text-3xl font-black text-white">Social Hub</h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-300">
            Publish market observations, learn from other members, and earn 10 GoldCoins for a valid community post.
          </p>
        </div>
        <Link href="/dashboard/referral" className="inline-flex items-center justify-center gap-2 rounded-xl border border-amber-500/30 px-4 py-2.5 text-sm font-semibold text-amber-300 hover:bg-amber-500/10">
          <Users className="h-4 w-4" /> Invite members
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "Recent contributors", value: stats.members, icon: Users },
          { label: "Community posts", value: stats.posts, icon: MessageCircle },
          { label: "Post rewards shown", value: stats.rewards, icon: Coins },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <Icon className="h-5 w-5 text-amber-400" />
            <p className="mt-3 text-2xl font-black text-white">{value.toLocaleString()}</p>
            <p className="text-xs text-slate-400">{label}</p>
          </div>
        ))}
      </div>

      {user ? (
        <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4">
          <div className="flex gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500 text-sm font-black text-slate-950">
              {initials(user.name, user.username)}
            </div>
            <div className="min-w-0 flex-1">
              <textarea
                value={content}
                onChange={event => setContent(event.target.value.slice(0, 2_000))}
                rows={3}
                placeholder="Share a useful gold or crypto market insight…"
                className="w-full resize-none rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-amber-500/50"
              />
              <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                <p className="flex items-center gap-1.5 text-xs text-slate-400">
                  <ShieldCheck className="h-3.5 w-3.5" /> No guaranteed-return claims or personal information.
                </p>
                <button
                  type="button"
                  onClick={() => void publish()}
                  disabled={!content.trim() || createPost.isPending}
                  className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-sm font-bold text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {createPost.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Publish
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3 rounded-2xl border border-blue-500/20 bg-blue-500/10 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold text-white">Join the conversation</p>
            <p className="text-sm text-slate-400">Sign in to publish posts and earn community rewards.</p>
          </div>
          <button
            type="button"
            onClick={() => { window.location.href = getLoginUrl("/social"); }}
            className="rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-bold text-slate-950"
          >
            Sign in to post
          </button>
        </div>
      )}

      <div className="rounded-2xl border border-white/10 bg-slate-950/60">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div>
            <h3 className="font-bold text-white">Community feed</h3>
            <p className="text-xs text-slate-500">Real posts from GoldVaults members</p>
          </div>
          <button
            type="button"
            onClick={() => feed.refetch()}
            disabled={feed.isFetching}
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-300 disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${feed.isFetching ? "animate-spin" : ""}`} /> Refresh
          </button>
        </div>

        {feed.isLoading ? (
          <div className="flex items-center justify-center gap-2 p-12 text-sm text-slate-400">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading community posts…
          </div>
        ) : feed.error ? (
          <div className="p-8 text-center">
            <p className="text-sm text-red-300">{feed.error.message}</p>
            <button onClick={() => feed.refetch()} className="mt-3 text-sm font-semibold text-amber-400">Try again</button>
          </div>
        ) : posts.length === 0 ? (
          <div className="p-12 text-center">
            <MessageCircle className="mx-auto h-8 w-8 text-slate-600" />
            <p className="mt-3 font-semibold text-white">No community posts yet</p>
            <p className="text-sm text-slate-500">The first useful market insight can be yours.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/10">
            {posts.map(post => (
              <article id={`post-${post.id}`} key={post.id} className="p-5">
                <div className="flex items-start gap-3">
                  {post.authorAvatar ? (
                    <img src={post.authorAvatar} alt="" className="h-10 w-10 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-amber-300">
                      {initials(post.authorName, post.authorUsername)}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="font-semibold text-white">{post.authorName || "GoldVault Member"}</span>
                      {post.authorUsername && <span className="text-xs text-amber-400">@{post.authorUsername}</span>}
                      <span className="text-xs text-slate-500">{timeAgo(post.createdAt)}</span>
                    </div>
                    {post.content && <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-300">{post.content}</p>}
                    {post.mediaType === "image" && post.mediaUrl && (
                      <img src={post.mediaUrl} alt="Community post attachment" className="mt-3 max-h-80 rounded-xl object-cover" />
                    )}
                    <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
                      <span>{Number(post.likes || 0).toLocaleString()} likes</span>
                      <span>{Number(post.shares || 0).toLocaleString()} shares</span>
                      <button onClick={() => void sharePost(post.id, post.content)} className="ml-auto inline-flex items-center gap-1.5 hover:text-amber-400">
                        <Share2 className="h-3.5 w-3.5" /> Share
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
