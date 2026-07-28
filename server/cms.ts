import { TRPCError } from "@trpc/server";
import {
  getPlatformSettings,
  savePlatformSettings,
  type WebsiteContentInput,
  type WebsitePageInput,
} from "./platformSettings";

export type WebsiteBranding = WebsiteContentInput["branding"];
export type WebsiteHomeContent = WebsiteContentInput["home"];

async function updateWebsite(
  update: (website: WebsiteContentInput) => WebsiteContentInput,
) {
  const settings = await getPlatformSettings();
  const website = update(settings.website);
  await savePlatformSettings({ ...settings, website });
  return website;
}

export async function getWebsiteContent() {
  const settings = await getPlatformSettings();
  return settings.website;
}

export async function saveWebsiteBranding(branding: WebsiteBranding) {
  return updateWebsite((website) => ({ ...website, branding }));
}

export async function saveWebsiteHome(home: WebsiteHomeContent) {
  return updateWebsite((website) => ({ ...website, home }));
}

export async function saveWebsitePage(
  input: Omit<WebsitePageInput, "id" | "createdAt" | "updatedAt" | "publishedAt"> & {
    id?: string;
  },
) {
  let savedPage: WebsitePageInput | undefined;
  await updateWebsite((website) => {
    const now = new Date().toISOString();
    const existing = input.id
      ? website.pages.find((page) => page.id === input.id)
      : undefined;
    if (input.id && !existing) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Page not found" });
    }
    if (!existing && website.pages.length >= 100) {
      throw new TRPCError({
        code: "PRECONDITION_FAILED",
        message: "The website page limit has been reached",
      });
    }

    const duplicate = website.pages.find(
      (page) => page.slug === input.slug && page.id !== input.id,
    );
    if (duplicate) {
      throw new TRPCError({ code: "CONFLICT", message: "That page URL is already in use" });
    }

    savedPage = {
      ...input,
      id: existing?.id ?? crypto.randomUUID(),
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
      publishedAt:
        input.status === "published"
          ? existing?.publishedAt ?? now
          : null,
    };
    const pages = existing
      ? website.pages.map((page) => (page.id === existing.id ? savedPage! : page))
      : [...website.pages, savedPage];
    return { ...website, pages };
  });

  return savedPage!;
}

export async function deleteWebsitePage(id: string) {
  let found = false;
  await updateWebsite((website) => {
    found = website.pages.some((page) => page.id === id);
    return {
      ...website,
      pages: website.pages.filter((page) => page.id !== id),
    };
  });
  if (!found) throw new TRPCError({ code: "NOT_FOUND", message: "Page not found" });
  return { success: true };
}

export async function getPublicWebsiteContent() {
  const website = await getWebsiteContent();
  return {
    branding: website.branding,
    home: website.home,
    navigationPages: website.pages
      .filter((page) => page.status === "published" && page.showInNavigation)
      .sort((a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title))
      .map(({ slug, title }) => ({ slug, title })),
  };
}

export async function getPublishedWebsitePage(slug: string) {
  const website = await getWebsiteContent();
  const page = website.pages.find(
    (candidate) => candidate.slug === slug && candidate.status === "published",
  );
  if (!page) throw new TRPCError({ code: "NOT_FOUND", message: "Page not found" });
  return page;
}
