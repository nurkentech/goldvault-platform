import { useState } from "react";
import { ExternalLink, FilePlus2, Image, Loader2, Save, Upload } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

type BlogStatus = "draft" | "published" | "archived";

interface BlogEditor {
  id?: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImageUrl: string;
  seoTitle: string;
  seoDescription: string;
  status: BlogStatus;
}

const emptyPost = (): BlogEditor => ({
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  coverImageUrl: "",
  seoTitle: "",
  seoDescription: "",
  status: "draft",
});

const inputClass = "w-full rounded-lg border border-gray-800 bg-[#080d19] px-3 py-2.5 text-sm text-white outline-none transition focus:border-amber-500/50";

export default function AdminBlog() {
  const posts = trpc.advanced.admin.blog.list.useQuery();
  const upsert = trpc.advanced.admin.blog.upsert.useMutation();
  const uploadAsset = trpc.admin.cms.uploadBrandAsset.useMutation();
  const utils = trpc.useUtils();
  const [editor, setEditor] = useState<BlogEditor>(emptyPost);

  const editPost = (post: NonNullable<typeof posts.data>[number]) => {
    setEditor({
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      coverImageUrl: post.coverImageUrl ?? "",
      seoTitle: post.seoTitle ?? "",
      seoDescription: post.seoDescription ?? "",
      status: post.status,
    });
  };

  const save = async (status: BlogStatus = editor.status) => {
    try {
      await upsert.mutateAsync({
        id: editor.id,
        title: editor.title,
        slug: editor.slug,
        excerpt: editor.excerpt,
        content: editor.content,
        coverImageUrl: editor.coverImageUrl || undefined,
        seoTitle: editor.seoTitle || editor.title,
        seoDescription: editor.seoDescription || editor.excerpt.slice(0, 320),
        status,
      });
      setEditor((current) => ({ ...current, status }));
      await Promise.all([
        utils.advanced.admin.blog.list.invalidate(),
        utils.advanced.blog.list.invalidate(),
      ]);
      toast.success(status === "published" ? "Article published to Blog and homepage News" : status === "archived" ? "Article archived" : "Draft saved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save article");
    }
  };

  const uploadCover = async (file?: File) => {
    if (!file) return;
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;
    if (!allowedTypes.includes(file.type as (typeof allowedTypes)[number])) return toast.error("Choose a JPG, PNG, WebP, or GIF image");
    if (file.size > 2 * 1024 * 1024) return toast.error("Cover image must be smaller than 2 MB");
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      });
      const uploaded = await uploadAsset.mutateAsync({ filename: file.name, mimeType: file.type as (typeof allowedTypes)[number], dataBase64: dataUrl.split(",", 2)[1] ?? "" });
      setEditor((current) => ({ ...current, coverImageUrl: uploaded.url }));
      toast.success("Cover uploaded. Save or publish the article to apply it.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Cover upload failed");
    }
  };

  const valid = editor.title.trim().length >= 3 && editor.slug.length >= 3 && editor.excerpt.trim().length >= 10 && editor.content.trim().length >= 20;

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div><h1 className="text-2xl font-bold text-white">News & Blog CMS</h1><p className="mt-1 text-sm text-gray-400">Published articles automatically appear in the homepage News feed and public Blog.</p></div>
        <div className="flex gap-2"><a href="/blog" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-gray-700 px-4 py-2 text-sm text-gray-300 hover:text-amber-400">View Blog <ExternalLink className="h-4 w-4" /></a><button type="button" onClick={() => setEditor(emptyPost())} className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-black"><FilePlus2 className="h-4 w-4" /> New article</button></div>
      </header>

      <div className="grid gap-6 xl:grid-cols-[20rem_1fr]">
        <aside className="h-fit space-y-2 rounded-xl border border-gray-800/60 bg-[#0d1321] p-4">
          <h2 className="mb-3 text-sm font-semibold text-white">Articles</h2>
          {posts.isLoading ? <div className="h-32 animate-pulse rounded-lg bg-gray-800/50" /> : posts.data?.length ? posts.data.map((post) => <button key={post.id} type="button" onClick={() => editPost(post)} className={`w-full rounded-lg border p-3 text-left ${editor.id === post.id ? "border-amber-500/30 bg-amber-500/10" : "border-gray-800 bg-[#080d19] hover:border-gray-700"}`}><p className="truncate text-sm font-medium text-white">{post.title}</p><div className="mt-1 flex justify-between gap-2 text-[10px]"><span className="truncate text-gray-500">/blog/{post.slug}</span><span className={post.status === "published" ? "text-emerald-400" : post.status === "archived" ? "text-gray-500" : "text-amber-400"}>{post.status}</span></div></button>) : <p className="py-8 text-center text-xs text-gray-500">No articles created yet.</p>}
        </aside>

        <section className="space-y-5 rounded-xl border border-gray-800/60 bg-[#0d1321] p-6">
          <div><h2 className="text-lg font-semibold text-white">{editor.id ? "Edit article" : "Create article"}</h2><p className="text-xs text-gray-400">Only articles with Published status appear publicly.</p></div>
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Article title"><input className={inputClass} value={editor.title} onChange={(event) => { const title = event.target.value; setEditor((current) => ({ ...current, title, slug: current.id ? current.slug : title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") })); }} /></Field>
            <Field label="URL slug"><div className="flex items-center rounded-lg border border-gray-800 bg-[#080d19] pl-3 text-sm text-gray-500">/blog/<input className="w-full bg-transparent px-1 py-2.5 text-white outline-none" value={editor.slug} onChange={(event) => setEditor({ ...editor, slug: event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") })} /></div></Field>
            <div className="md:col-span-2"><Field label="News excerpt"><textarea rows={3} className={inputClass} value={editor.excerpt} onChange={(event) => setEditor({ ...editor, excerpt: event.target.value })} /></Field></div>
            <div className="md:col-span-2"><Field label="Article content"><textarea rows={16} className={`${inputClass} leading-relaxed`} value={editor.content} onChange={(event) => setEditor({ ...editor, content: event.target.value })} /></Field></div>
            <div className="md:col-span-2 grid gap-4 md:grid-cols-[14rem_1fr]">
              <div className="flex min-h-36 items-center justify-center overflow-hidden rounded-xl border border-dashed border-gray-700 bg-[#080d19]">{editor.coverImageUrl ? <img src={editor.coverImageUrl} alt="Article cover preview" className="h-36 w-full object-cover" /> : <Image className="h-9 w-9 text-gray-600" />}</div>
              <div className="space-y-3"><Field label="Cover image URL"><input className={inputClass} value={editor.coverImageUrl} onChange={(event) => setEditor({ ...editor, coverImageUrl: event.target.value })} placeholder="https://…" /></Field><label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-700 px-4 py-2 text-sm text-gray-300 hover:text-amber-400">{uploadAsset.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} Upload cover<input type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="hidden" onChange={(event) => void uploadCover(event.target.files?.[0])} /></label></div>
            </div>
            <Field label="SEO title"><input className={inputClass} value={editor.seoTitle} onChange={(event) => setEditor({ ...editor, seoTitle: event.target.value })} placeholder={editor.title} /></Field>
            <Field label="SEO description"><textarea rows={3} className={inputClass} value={editor.seoDescription} onChange={(event) => setEditor({ ...editor, seoDescription: event.target.value })} placeholder={editor.excerpt.slice(0, 160)} /></Field>
          </div>
          <div className="flex flex-wrap items-center gap-3 border-t border-gray-800 pt-5">
            <button type="button" disabled={!valid || upsert.isPending} onClick={() => void save("draft")} className="inline-flex items-center gap-2 rounded-lg border border-amber-500/30 px-4 py-2.5 text-sm text-amber-400 disabled:opacity-40"><Save className="h-4 w-4" /> Save draft</button>
            <button type="button" disabled={!valid || upsert.isPending} onClick={() => void save("published")} className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-semibold text-black disabled:opacity-40">{upsert.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} Publish to News & Blog</button>
            {editor.id && <button type="button" disabled={upsert.isPending} onClick={() => void save("archived")} className="rounded-lg px-4 py-2.5 text-sm text-gray-400 hover:text-red-400">Archive</button>}
          </div>
        </section>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1.5 block text-xs text-gray-400">{label}</span>{children}</label>;
}
