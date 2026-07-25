import { useEffect, useState } from "react";
import { Link, useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import SeoManager from "@/components/SeoManager";
import { Search } from "lucide-react";

export function KnowledgeBase() {
  const [search, setSearch] = useState(""); const posts = trpc.advanced.blog.list.useQuery({ search: search || undefined, limit: 50 });
  return <div className="min-h-screen bg-background"><SeoManager/><PublicNav/><main className="max-w-6xl mx-auto px-4 py-24"><h1 className="text-4xl font-bold">GoldVaults Knowledge Base</h1><p className="text-muted-foreground mt-2">Guides for gold, crypto, security, and platform features.</p><div className="relative max-w-xl my-8"><Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground"/><input aria-label="Search articles" value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search guides…" className="w-full rounded-xl border border-white/10 bg-card pl-10 pr-4 py-2.5"/></div>{posts.isLoading?<div className="grid md:grid-cols-3 gap-4">{[1,2,3].map((id)=><div key={id} className="h-52 animate-pulse bg-white/5 rounded-2xl"/>)}</div>:<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">{posts.data?.map((post)=><Link key={post.id} href={`/blog/${post.slug}`}><article className="h-full rounded-2xl border border-white/5 bg-card/50 overflow-hidden hover:border-amber-500/30 transition"><div className="h-36 bg-gradient-to-br from-amber-500/20 to-purple-500/10">{post.coverImageUrl&&<img src={post.coverImageUrl} alt="" className="w-full h-full object-cover"/>}</div><div className="p-5"><h2 className="font-bold">{post.title}</h2><p className="mt-2 text-sm text-muted-foreground line-clamp-3">{post.excerpt}</p><span className="inline-block mt-3 text-sm text-amber-500">Read article →</span></div></article></Link>)}</div>}</main><PublicFooter/></div>;
}

export function KnowledgeArticle() {
  const [, params] = useRoute<{slug:string}>("/blog/:slug"); const post = trpc.advanced.blog.bySlug.useQuery({slug:params?.slug??""},{enabled:Boolean(params?.slug)});
  useEffect(() => {
    if (!post.data) return;
    const previousTitle = document.title;
    document.title = `${post.data.seoTitle || post.data.title} | GoldVaults`;
    let description = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    const previousDescription = description?.content;
    if (!description) {
      description = document.createElement("meta");
      description.name = "description";
      document.head.appendChild(description);
    }
    description.content = post.data.seoDescription || post.data.excerpt || "GoldVaults knowledge base article";
    return () => {
      document.title = previousTitle;
      if (description && previousDescription !== undefined) description.content = previousDescription;
    };
  }, [post.data]);
  if (post.isLoading) return <div className="min-h-screen bg-background p-24"><div className="max-w-3xl mx-auto h-96 animate-pulse bg-white/5 rounded-2xl"/></div>;
  if (!post.data) return <div className="min-h-screen grid place-items-center"><p>Article not found.</p></div>;
  return <div className="min-h-screen bg-background"><PublicNav/><article className="max-w-3xl mx-auto px-4 py-24"><p className="text-sm text-amber-500">Knowledge Base</p><h1 className="text-4xl font-bold mt-2">{post.data.title}</h1><p className="text-muted-foreground mt-3">{post.data.excerpt}</p>{post.data.coverImageUrl&&<img src={post.data.coverImageUrl} alt="" className="w-full rounded-2xl my-8"/>}<div className="prose prose-invert max-w-none whitespace-pre-wrap leading-relaxed">{post.data.content}</div></article><PublicFooter/></div>;
}

function PublicNav(){return <nav className="fixed top-0 inset-x-0 z-40 border-b border-white/5 bg-background/90 backdrop-blur"><div className="max-w-6xl mx-auto h-16 px-4 flex items-center justify-between"><Link href="/" className="font-black">Gold<span className="text-amber-500">Vaults</span></Link><div className="flex gap-4 text-sm"><Link href="/blog">Knowledge Base</Link><Link href="/dashboard">Dashboard</Link></div></div></nav>}
function PublicFooter(){return <footer className="border-t border-white/5 py-8 text-center text-sm text-muted-foreground">© {new Date().getFullYear()} GoldVaults · Educational content is not financial advice.</footer>}
