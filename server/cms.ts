import { TRPCError } from "@trpc/server";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import {
  DEFAULT_HERO_SLIDES,
  DEFAULT_WEBSITE_CONTENT,
  getPlatformSettings,
  type WebsiteContentInput,
  type WebsitePageInput,
} from "./platformSettings";

export type WebsiteBranding = WebsiteContentInput["branding"];
export type WebsiteHomeContent = WebsiteContentInput["home"];

const WEBSITE_CONTENT_FILE = "website-content.json";
let websiteWriteQueue: Promise<void> = Promise.resolve();

function getWebsiteDataDirectory() {
  const configuredDirectory = process.env.GOLDVAULT_DATA_DIR?.trim();
  if (configuredDirectory) return resolve(configuredDirectory);

  const appRoot = process.env.GOLDVAULT_APP_ROOT?.trim();
  if (appRoot) return resolve(appRoot, "data");

  const homeDirectory = process.env.HOME?.trim() || process.env.USERPROFILE?.trim();
  if (process.env.NODE_ENV === "production" && homeDirectory) {
    return resolve(homeDirectory, "goldvault-app", "data");
  }

  return resolve(process.cwd(), "data");
}

function getWebsiteContentPath() {
  return resolve(getWebsiteDataDirectory(), WEBSITE_CONTENT_FILE);
}

function normalizeWebsiteContent(value: unknown): WebsiteContentInput | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;

  const stored = value as Partial<WebsiteContentInput>;
  const storedHome = stored.home;
  const slides = Array.isArray(storedHome?.slides) && storedHome.slides.length > 0
    ? storedHome.slides.slice(0, 5).map((slide, index) => {
        const fallback = DEFAULT_HERO_SLIDES[index % DEFAULT_HERO_SLIDES.length];
        return {
          ...fallback,
          ...slide,
          stats: Array.isArray(slide.stats) && slide.stats.length > 0
            ? slide.stats.slice(0, 3)
            : fallback.stats.map((stat) => ({ ...stat })),
        };
      })
    : DEFAULT_HERO_SLIDES.map((slide) => ({
        ...slide,
        stats: slide.stats.map((stat) => ({ ...stat })),
      }));

  return {
    ...DEFAULT_WEBSITE_CONTENT,
    ...stored,
    branding: {
      ...DEFAULT_WEBSITE_CONTENT.branding,
      ...(stored.branding ?? {}),
    },
    home: {
      ...DEFAULT_WEBSITE_CONTENT.home,
      ...(storedHome ?? {}),
      slides,
    },
    pages: Array.isArray(stored.pages) ? stored.pages : [],
  };
}

async function readWebsiteContentFile(): Promise<WebsiteContentInput | null> {
  try {
    const value = JSON.parse(await readFile(getWebsiteContentPath(), "utf8"));
    return normalizeWebsiteContent(value);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      console.error("[CMS] Could not read persistent website content:", error);
    }
    return null;
  }
}

async function writeWebsiteContentFile(website: WebsiteContentInput) {
  const directory = getWebsiteDataDirectory();
  const destination = getWebsiteContentPath();
  const temporary = resolve(
    directory,
    `${WEBSITE_CONTENT_FILE}.${process.pid}.${randomUUID()}.tmp`,
  );

  await mkdir(directory, { recursive: true, mode: 0o700 });
  try {
    await writeFile(temporary, `${JSON.stringify(website, null, 2)}\n`, {
      encoding: "utf8",
      flag: "wx",
      mode: 0o600,
    });
    await rename(temporary, destination);
  } catch (error) {
    await rm(temporary, { force: true }).catch(() => undefined);
    throw error;
  }
}

function withWebsiteWrite<T>(operation: () => Promise<T>): Promise<T> {
  const result = websiteWriteQueue.then(operation, operation);
  websiteWriteQueue = result.then(() => undefined, () => undefined);
  return result;
}

async function updateWebsite(
  update: (website: WebsiteContentInput) => WebsiteContentInput,
) {
  return withWebsiteWrite(async () => {
    const stored = await readWebsiteContentFile();
    const current = stored ?? (await getPlatformSettings()).website;
    const website = update(current);
    await writeWebsiteContentFile(website);
    return website;
  });
}

export async function getWebsiteContent() {
  const stored = await readWebsiteContentFile();
  if (stored) return stored;

  // Seed persistent storage once from the existing database. Deployments only
  // replace release directories, so this file remains available across builds.
  return withWebsiteWrite(async () => {
    const existing = await readWebsiteContentFile();
    if (existing) return existing;
    const website = (await getPlatformSettings()).website;
    await writeWebsiteContentFile(website);
    return website;
  });
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
      id: existing?.id ?? randomUUID(),
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
