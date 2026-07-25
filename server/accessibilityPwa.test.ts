import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(import.meta.dirname, "..");
const read = (file: string) => fs.readFileSync(path.join(root, file), "utf8");

describe("accessibility and PWA assets", () => {
  it("provides a keyboard skip link and visible focus styles", () => {
    expect(read("client/src/components/UserDashboardLayout.tsx")).toContain('href="#dashboard-content"');
    expect(read("client/src/index.css")).toContain(":focus-visible");
  });

  it("honors reduced-motion preferences", () => {
    expect(read("client/src/index.css")).toContain("prefers-reduced-motion: reduce");
  });

  it("ships a manifest and push-capable service worker", () => {
    expect(JSON.parse(read("client/public/manifest.webmanifest"))).toMatchObject({ display: "standalone" });
    const worker = read("client/public/sw.js");
    expect(worker).toContain('addEventListener("push"');
    expect(worker).toContain('addEventListener("notificationclick"');
  });

  it("supports all five requested languages and Arabic directionality", () => {
    const i18n = read("client/src/contexts/I18nContext.tsx");
    for (const language of ["en", "fr", "es", "ar", "pt"]) expect(i18n).toContain(`${language}:`);
    expect(i18n).toContain('language === "ar" ? "rtl" : "ltr"');
  });
});
