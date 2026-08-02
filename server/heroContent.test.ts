import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { DEFAULT_HERO_SLIDES, DEFAULT_WEBSITE_CONTENT } from "./platformSettings";

const read = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");
const settings = read("server/platformSettings.ts");
const adminRouter = read("server/adminRouter.ts");
const adminContent = read("client/src/pages/admin/AdminContent.tsx");
const heroSlider = read("client/src/components/HeroSlider.tsx");

describe("admin-managed homepage banners", () => {
  it("provides safe multi-banner defaults", () => {
    expect(DEFAULT_HERO_SLIDES).toHaveLength(3);
    expect(DEFAULT_HERO_SLIDES.every((slide) => slide.enabled)).toBe(true);
    expect(DEFAULT_HERO_SLIDES.every((slide) => slide.stats.length === 3)).toBe(true);
    expect(DEFAULT_WEBSITE_CONTENT.home.slides).toEqual(DEFAULT_HERO_SLIDES);
  });

  it("migrates legacy homepage fields into the first banner without a database migration", () => {
    expect(settings).toContain("const fallbackSlides = DEFAULT_HERO_SLIDES.map");
    expect(settings).toContain("badge: mergedHome.badge");
    expect(settings).toContain("slides,");
  });

  it("validates banner content and requires at least one visible banner", () => {
    expect(adminRouter).toContain("const websiteHeroSlideSchema");
    expect(adminRouter).toContain("slides: z.array(websiteHeroSlideSchema).min(1).max(5)");
    expect(adminRouter).toContain("home.slides.some((slide) => slide.enabled)");
  });

  it("lets administrators edit, order, hide, remove, and upload banner images", () => {
    expect(adminContent).toContain("Header banners");
    expect(adminContent).toContain("uploadHeroImage");
    expect(adminContent).toContain("moveHeroSlide");
    expect(adminContent).toContain("removeHeroSlide");
    expect(adminContent).toContain("Save header banners");
  });

  it("renders every enabled CMS banner and honors its image and destinations", () => {
    expect(heroSlider).toContain("managedHome?.slides?.filter((slide) => slide.enabled)");
    expect(heroSlider).toContain("const displaySlides");
    expect(heroSlider).toContain("slide.heroImageUrl");
    expect(heroSlider).toContain("followCta(slide.primaryCtaUrl)");
    expect(heroSlider).toContain("followCta(slide.secondaryCtaUrl)");
    expect(heroSlider).not.toContain("current === 0 && managedHome");
  });

  it("does not retain unsupported hero statistics or regulatory claims", () => {
    expect(heroSlider).not.toContain("$428M+");
    expect(heroSlider).not.toContain("$500M");
    expect(heroSlider).not.toContain("SEC Regulated");
    expect(heroSlider).not.toContain("8 Mines");
  });
});
