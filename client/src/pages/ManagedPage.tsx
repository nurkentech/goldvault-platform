import { useEffect } from "react";
import { ArrowLeft, FileQuestion } from "lucide-react";
import { Link, useLocation, useRoute } from "wouter";
import PremiumNav from "@/components/PremiumNav";
import { Footer } from "@/components/BottomSections";
import { trpc } from "@/lib/trpc";

export default function ManagedPage() {
  const [, params] = useRoute<{ slug: string }>("/:slug");
  const [, navigate] = useLocation();
  const slug = params?.slug ?? "";
  const page = trpc.content.pageBySlug.useQuery(
    { slug },
    { enabled: Boolean(slug), retry: false },
  );

  useEffect(() => {
    if (!page.data) return;
    document.title = page.data.seoTitle || `${page.data.title} | GoldVaults`;
    let description = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!description) {
      description = document.createElement("meta");
      description.name = "description";
      document.head.appendChild(description);
    }
    description.content = page.data.seoDescription || page.data.excerpt;
  }, [page.data]);

  const openAuth = (mode: "login" | "register") => {
    navigate(`/?auth=${mode}`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <PremiumNav onLoginClick={() => openAuth("login")} onRegisterClick={() => openAuth("register")} />
      {page.isLoading && (
        <main className="mx-auto max-w-4xl space-y-5 px-4 pb-20 pt-32">
          <div className="h-8 w-28 animate-pulse rounded-full bg-white/5" />
          <div className="h-14 w-3/4 animate-pulse rounded-xl bg-white/5" />
          <div className="h-80 animate-pulse rounded-2xl bg-white/5" />
        </main>
      )}
      {page.isError && (
        <main className="mx-auto flex max-w-2xl flex-col items-center px-4 pb-24 pt-40 text-center">
          <FileQuestion className="h-14 w-14 text-amber-400" />
          <h1 className="mt-5 text-3xl font-bold">Page not found</h1>
          <p className="mt-3 text-slate-400">This page does not exist or has not been published.</p>
          <Link href="/" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-3 font-semibold text-black">
            <ArrowLeft className="h-4 w-4" /> Return home
          </Link>
        </main>
      )}
      {page.data && (
        <main>
          <header className="border-b border-white/5 bg-gradient-to-b from-amber-500/10 to-transparent px-4 pb-16 pt-36">
            <div className="mx-auto max-w-4xl">
              <Link href="/" className="inline-flex items-center gap-2 text-sm text-amber-400 hover:text-amber-300">
                <ArrowLeft className="h-4 w-4" /> Home
              </Link>
              <h1 className="mt-7 text-4xl font-black tracking-tight sm:text-5xl">{page.data.title}</h1>
              {page.data.excerpt && <p className="mt-5 max-w-3xl text-lg leading-relaxed text-slate-300">{page.data.excerpt}</p>}
            </div>
          </header>
          <article className="mx-auto max-w-4xl px-4 py-14">
            <SafePageContent body={page.data.body} />
          </article>
        </main>
      )}
      <Footer />
    </div>
  );
}

function SafePageContent({ body }: { body: string }) {
  const blocks = body.split(/\n\s*\n/).filter((block) => block.trim());
  return (
    <div className="space-y-6 text-base leading-8 text-slate-300">
      {blocks.map((block, index) => {
        const value = block.trim();
        if (value.startsWith("### ")) return <h3 key={index} className="pt-3 text-xl font-bold text-white">{value.slice(4)}</h3>;
        if (value.startsWith("## ")) return <h2 key={index} className="pt-4 text-2xl font-bold text-white">{value.slice(3)}</h2>;
        if (value.startsWith("# ")) return <h2 key={index} className="pt-4 text-3xl font-bold text-white">{value.slice(2)}</h2>;
        const lines = value.split("\n");
        if (lines.every((line) => line.trim().startsWith("- "))) {
          return <ul key={index} className="list-disc space-y-2 pl-6">{lines.map((line, itemIndex) => <li key={itemIndex}>{line.trim().slice(2)}</li>)}</ul>;
        }
        return <p key={index} className="whitespace-pre-line">{value}</p>;
      })}
    </div>
  );
}
