import { useEffect, useState } from "react";
import {
  ExternalLink,
  FilePlus2,
  FileText,
  Home,
  Image,
  Loader2,
  Save,
  Trash2,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

type PageStatus = "draft" | "published";

interface PageEditor {
  id?: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  seoTitle: string;
  seoDescription: string;
  status: PageStatus;
  showInNavigation: boolean;
  sortOrder: number;
}

const emptyPage = (): PageEditor => ({
  slug: "",
  title: "",
  excerpt: "",
  body: "",
  seoTitle: "",
  seoDescription: "",
  status: "draft",
  showInNavigation: false,
  sortOrder: 100,
});

const inputClass =
  "w-full rounded-lg border border-gray-800 bg-[#080d19] px-3 py-2.5 text-sm text-white outline-none transition focus:border-amber-500/50";

export default function AdminContent() {
  const [activeTab, setActiveTab] = useState<"branding" | "home" | "pages">("branding");
  const cmsQuery = trpc.admin.cms.get.useQuery();
  const utils = trpc.useUtils();
  const updateBranding = trpc.admin.cms.updateBranding.useMutation();
  const updateHome = trpc.admin.cms.updateHome.useMutation();
  const savePageMutation = trpc.admin.cms.savePage.useMutation();
  const deletePageMutation = trpc.admin.cms.deletePage.useMutation();
  const uploadAsset = trpc.admin.cms.uploadBrandAsset.useMutation();
  const [branding, setBranding] = useState({
    siteName: "GoldVaults",
    tagline: "Global Financial Freedom",
    logoUrl: "",
    logoAlt: "GoldVaults logo",
  });
  const [home, setHome] = useState({
    badge: "",
    title: "",
    titleAccent: "",
    subtitle: "",
    primaryCtaLabel: "",
    secondaryCtaLabel: "",
    secondaryCtaUrl: "/markets",
    heroImageUrl: "",
  });
  const [page, setPage] = useState<PageEditor>(emptyPage);

  useEffect(() => {
    if (!cmsQuery.data) return;
    setBranding(cmsQuery.data.branding);
    setHome(cmsQuery.data.home);
  }, [cmsQuery.data]);

  const refresh = async () => {
    await Promise.all([
      utils.admin.cms.get.invalidate(),
      utils.content.website.invalidate(),
    ]);
  };

  const saveBranding = async () => {
    try {
      await updateBranding.mutateAsync(branding);
      await refresh();
      toast.success("Website branding updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update branding");
    }
  };

  const saveHome = async () => {
    try {
      await updateHome.mutateAsync(home);
      await refresh();
      toast.success("Homepage content updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update homepage");
    }
  };

  const uploadLogo = async (file?: File) => {
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Logo image must be smaller than 2 MB");
      return;
    }
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      });
      const dataBase64 = dataUrl.split(",", 2)[1] ?? "";
      const uploaded = await uploadAsset.mutateAsync({
        filename: file.name,
        mimeType: file.type as "image/jpeg" | "image/png" | "image/webp" | "image/gif",
        dataBase64,
      });
      setBranding((current) => ({ ...current, logoUrl: uploaded.url }));
      toast.success("Logo uploaded. Save branding to publish it.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Logo upload failed");
    }
  };

  const editPage = (selected: NonNullable<typeof cmsQuery.data>["pages"][number]) => {
    setPage({
      id: selected.id,
      slug: selected.slug,
      title: selected.title,
      excerpt: selected.excerpt,
      body: selected.body,
      seoTitle: selected.seoTitle,
      seoDescription: selected.seoDescription,
      status: selected.status,
      showInNavigation: selected.showInNavigation,
      sortOrder: selected.sortOrder,
    });
  };

  const savePage = async () => {
    try {
      const saved = await savePageMutation.mutateAsync(page);
      await refresh();
      editPage(saved);
      toast.success(saved.status === "published" ? "Page published" : "Draft saved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save page");
    }
  };

  const deletePage = async () => {
    if (!page.id || !window.confirm(`Delete "${page.title}"? This cannot be undone.`)) return;
    try {
      await deletePageMutation.mutateAsync({ id: page.id });
      setPage(emptyPage());
      await refresh();
      toast.success("Page deleted");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to delete page");
    }
  };

  const tabs = [
    { id: "branding" as const, label: "Branding & Logo", icon: Image },
    { id: "home" as const, label: "Homepage", icon: Home },
    { id: "pages" as const, label: "Pages", icon: FileText },
  ];

  if (cmsQuery.isLoading) {
    return <div className="h-72 animate-pulse rounded-xl bg-gray-800/40" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Website Content</h1>
          <p className="mt-1 text-sm text-gray-400">
            Manage public branding, homepage copy, and publishable pages.
          </p>
        </div>
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-lg border border-gray-700 px-4 py-2 text-sm text-gray-300 hover:border-amber-500/40 hover:text-amber-400"
        >
          View website <ExternalLink className="h-4 w-4" />
        </a>
      </div>

      <div className="flex gap-1 overflow-x-auto rounded-xl border border-gray-800/60 bg-[#0d1321] p-1.5">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium ${
              activeTab === id
                ? "border border-amber-500/20 bg-amber-500/10 text-amber-400"
                : "text-gray-400 hover:bg-gray-800/50 hover:text-white"
            }`}
          >
            <Icon className="h-4 w-4" /> {label}
          </button>
        ))}
      </div>

      {activeTab === "branding" && (
        <section className="space-y-6 rounded-xl border border-gray-800/60 bg-[#0d1321] p-6">
          <div>
            <h2 className="text-lg font-semibold text-white">Brand identity</h2>
            <p className="text-xs text-gray-400">Used in the public header and footer.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-[12rem_1fr]">
            <div className="flex min-h-44 items-center justify-center rounded-xl border border-dashed border-gray-700 bg-[#080d19] p-4">
              {branding.logoUrl ? (
                <img src={branding.logoUrl} alt={branding.logoAlt} className="max-h-32 max-w-full object-contain" />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-2xl font-black text-black">
                  GV
                </div>
              )}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Site name">
                <input className={inputClass} value={branding.siteName} onChange={(event) => setBranding({ ...branding, siteName: event.target.value })} />
              </Field>
              <Field label="Tagline">
                <input className={inputClass} value={branding.tagline} onChange={(event) => setBranding({ ...branding, tagline: event.target.value })} />
              </Field>
              <Field label="Logo URL">
                <input className={inputClass} value={branding.logoUrl} onChange={(event) => setBranding({ ...branding, logoUrl: event.target.value })} placeholder="https://… or /manus-storage/…" />
              </Field>
              <Field label="Logo alternative text">
                <input className={inputClass} value={branding.logoAlt} onChange={(event) => setBranding({ ...branding, logoAlt: event.target.value })} />
              </Field>
              <label className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-lg border border-gray-700 px-4 py-2 text-sm text-gray-300 hover:border-amber-500/40 hover:text-amber-400">
                {uploadAsset.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                Upload logo
                <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="hidden" onChange={(event) => void uploadLogo(event.target.files?.[0])} />
              </label>
            </div>
          </div>
          <SaveButton pending={updateBranding.isPending} onClick={saveBranding} label="Save branding" />
        </section>
      )}

      {activeTab === "home" && (
        <section className="space-y-5 rounded-xl border border-gray-800/60 bg-[#0d1321] p-6">
          <div>
            <h2 className="text-lg font-semibold text-white">Homepage hero</h2>
            <p className="text-xs text-gray-400">Controls the main message visitors see first.</p>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Badge"><input className={inputClass} value={home.badge} onChange={(event) => setHome({ ...home, badge: event.target.value })} /></Field>
            <Field label="Headline"><input className={inputClass} value={home.title} onChange={(event) => setHome({ ...home, title: event.target.value })} /></Field>
            <Field label="Highlighted headline"><input className={inputClass} value={home.titleAccent} onChange={(event) => setHome({ ...home, titleAccent: event.target.value })} /></Field>
            <Field label="Hero image URL"><input className={inputClass} value={home.heroImageUrl} onChange={(event) => setHome({ ...home, heroImageUrl: event.target.value })} /></Field>
            <Field label="Primary button"><input className={inputClass} value={home.primaryCtaLabel} onChange={(event) => setHome({ ...home, primaryCtaLabel: event.target.value })} /></Field>
            <Field label="Secondary button"><input className={inputClass} value={home.secondaryCtaLabel} onChange={(event) => setHome({ ...home, secondaryCtaLabel: event.target.value })} /></Field>
            <Field label="Secondary button URL"><input className={inputClass} value={home.secondaryCtaUrl} onChange={(event) => setHome({ ...home, secondaryCtaUrl: event.target.value })} /></Field>
            <div className="md:col-span-2">
              <Field label="Introduction">
                <textarea rows={5} className={inputClass} value={home.subtitle} onChange={(event) => setHome({ ...home, subtitle: event.target.value })} />
              </Field>
            </div>
          </div>
          <SaveButton pending={updateHome.isPending} onClick={saveHome} label="Save homepage" />
        </section>
      )}

      {activeTab === "pages" && (
        <div className="grid gap-6 xl:grid-cols-[18rem_1fr]">
          <aside className="h-fit space-y-3 rounded-xl border border-gray-800/60 bg-[#0d1321] p-4">
            <button onClick={() => setPage(emptyPage())} className="flex w-full items-center justify-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-semibold text-black hover:bg-amber-400">
              <FilePlus2 className="h-4 w-4" /> New page
            </button>
            <div className="space-y-2">
              {cmsQuery.data?.pages.length === 0 && <p className="py-6 text-center text-xs text-gray-500">No pages created yet.</p>}
              {cmsQuery.data?.pages.map((item) => (
                <button key={item.id} onClick={() => editPage(item)} className={`w-full rounded-lg border p-3 text-left ${page.id === item.id ? "border-amber-500/30 bg-amber-500/10" : "border-gray-800 bg-[#080d19] hover:border-gray-700"}`}>
                  <p className="truncate text-sm font-medium text-white">{item.title}</p>
                  <div className="mt-1 flex items-center justify-between gap-2 text-[10px] text-gray-500">
                    <span className="truncate">/{item.slug}</span>
                    <span className={item.status === "published" ? "text-emerald-400" : "text-amber-400"}>{item.status}</span>
                  </div>
                </button>
              ))}
            </div>
          </aside>

          <section className="space-y-5 rounded-xl border border-gray-800/60 bg-[#0d1321] p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">{page.id ? "Edit page" : "Create page"}</h2>
                <p className="text-xs text-gray-400">Content is rendered as safe formatted text; raw HTML is never executed.</p>
              </div>
              {page.id && page.status === "published" && <a href={`/${page.slug}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-xs text-amber-400">Open page <ExternalLink className="h-3.5 w-3.5" /></a>}
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Page title"><input className={inputClass} value={page.title} onChange={(event) => setPage({ ...page, title: event.target.value })} /></Field>
              <Field label="URL slug"><div className="flex items-center rounded-lg border border-gray-800 bg-[#080d19] pl-3 text-sm text-gray-500"><span>/</span><input className="w-full bg-transparent px-1 py-2.5 text-white outline-none" value={page.slug} onChange={(event) => setPage({ ...page, slug: event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") })} /></div></Field>
              <div className="md:col-span-2"><Field label="Short description"><textarea rows={2} className={inputClass} value={page.excerpt} onChange={(event) => setPage({ ...page, excerpt: event.target.value })} /></Field></div>
              <div className="md:col-span-2"><Field label="Page content"><textarea rows={16} className={`${inputClass} font-mono leading-relaxed`} value={page.body} onChange={(event) => setPage({ ...page, body: event.target.value })} placeholder={"# Heading\n\nWrite paragraphs here.\n\n- Bullet item"} /></Field></div>
              <Field label="SEO title"><input className={inputClass} value={page.seoTitle} onChange={(event) => setPage({ ...page, seoTitle: event.target.value })} /></Field>
              <Field label="SEO description"><textarea rows={3} className={inputClass} value={page.seoDescription} onChange={(event) => setPage({ ...page, seoDescription: event.target.value })} /></Field>
              <Field label="Status"><select className={inputClass} value={page.status} onChange={(event) => setPage({ ...page, status: event.target.value as PageStatus })}><option value="draft">Draft</option><option value="published">Published</option></select></Field>
              <Field label="Navigation order"><input type="number" min={0} className={inputClass} value={page.sortOrder} onChange={(event) => setPage({ ...page, sortOrder: Number(event.target.value) })} /></Field>
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-300"><input type="checkbox" checked={page.showInNavigation} onChange={(event) => setPage({ ...page, showInNavigation: event.target.checked })} /> Show under Learn in the website menu</label>
            <div className="flex flex-wrap items-center gap-3">
              <SaveButton pending={savePageMutation.isPending} onClick={savePage} label={page.status === "published" ? "Publish page" : "Save draft"} />
              {page.id && <button onClick={deletePage} disabled={deletePageMutation.isPending} className="inline-flex items-center gap-2 rounded-lg border border-red-500/30 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10"><Trash2 className="h-4 w-4" /> Delete</button>}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1.5 block text-xs text-gray-400">{label}</span>{children}</label>;
}

function SaveButton({ pending, onClick, label }: { pending: boolean; onClick: () => void; label: string }) {
  return (
    <button onClick={onClick} disabled={pending} className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-2.5 text-sm font-semibold text-black hover:from-amber-400 hover:to-amber-500 disabled:opacity-50">
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} {label}
    </button>
  );
}
