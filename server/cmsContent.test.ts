import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { DEFAULT_WEBSITE_CONTENT } from "./platformSettings";

const read = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");
const adminRouter = read("server/adminRouter.ts");
const publicRouter = read("server/routers.ts");
const managedPage = read("client/src/pages/ManagedPage.tsx");
const adminContent = read("client/src/pages/admin/AdminContent.tsx");
const app = read("client/src/App.tsx");

describe("website content management", () => {
  it("provides safe defaults without requiring a schema migration", () => {
    expect(DEFAULT_WEBSITE_CONTENT.branding.siteName).toBe("GoldVaults");
    expect(DEFAULT_WEBSITE_CONTENT.home.title).toBeTruthy();
    expect(DEFAULT_WEBSITE_CONTENT.pages).toEqual([]);
  });

  it("keeps every CMS mutation behind admin authorization", () => {
    expect(adminRouter).toContain("cms: router({");
    expect(adminRouter).toContain("updateBranding: adminProcedure");
    expect(adminRouter).toContain("updateHome: adminProcedure");
    expect(adminRouter).toContain("savePage: adminProcedure");
    expect(adminRouter).toContain("deletePage: adminProcedure");
    expect(adminRouter).toContain("uploadBrandAsset: adminProcedure");
  });

  it("exposes only published pages through the public content router", () => {
    expect(publicRouter).toContain("getPublishedWebsitePage");
    expect(publicRouter).toContain("getPublicWebsiteContent");
    expect(managedPage).not.toContain("dangerouslySetInnerHTML");
  });

  it("registers the admin editor and dynamic page after fixed routes", () => {
    expect(adminContent).toContain("Website Content");
    expect(app).toContain('path="/admin/content"');
    expect(app.indexOf('path="/404"')).toBeLessThan(app.indexOf('path="/:slug"'));
  });
});
