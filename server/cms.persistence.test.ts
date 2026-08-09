import { mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  getWebsiteContent,
  saveWebsiteBranding,
  saveWebsiteHome,
} from "./cms";
import { DEFAULT_WEBSITE_CONTENT } from "./platformSettings";

let testDirectory: string | undefined;
const originalDataDirectory = process.env.GOLDVAULT_DATA_DIR;

async function seedWebsiteContent() {
  testDirectory = await mkdtemp(join(tmpdir(), "goldvault-cms-"));
  process.env.GOLDVAULT_DATA_DIR = testDirectory;
  await writeFile(
    join(testDirectory, "website-content.json"),
    JSON.stringify(DEFAULT_WEBSITE_CONTENT),
    "utf8",
  );
}

afterEach(async () => {
  if (originalDataDirectory === undefined) {
    delete process.env.GOLDVAULT_DATA_DIR;
  } else {
    process.env.GOLDVAULT_DATA_DIR = originalDataDirectory;
  }
  if (testDirectory) await rm(testDirectory, { recursive: true, force: true });
  testDirectory = undefined;
});

describe("persistent website CMS storage", () => {
  it("atomically persists an uploaded homepage banner URL", async () => {
    await seedWebsiteContent();
    const imageUrl = "/uploads/cms/branding/banner_test.webp";
    const home = {
      ...DEFAULT_WEBSITE_CONTENT.home,
      heroImageUrl: imageUrl,
      slides: DEFAULT_WEBSITE_CONTENT.home.slides.map((slide, index) =>
        index === 0 ? { ...slide, heroImageUrl: imageUrl } : slide,
      ),
    };

    await saveWebsiteHome(home);

    const diskContent = JSON.parse(
      await readFile(join(testDirectory!, "website-content.json"), "utf8"),
    );
    expect(diskContent.home.heroImageUrl).toBe(imageUrl);
    expect(diskContent.home.slides[0].heroImageUrl).toBe(imageUrl);
    expect((await getWebsiteContent()).home.slides[0].heroImageUrl).toBe(imageUrl);
    expect((await readdir(testDirectory!)).filter((file) => file.endsWith(".tmp"))).toEqual([]);
  });

  it("serializes concurrent CMS changes so one section does not overwrite another", async () => {
    await seedWebsiteContent();
    const home = {
      ...DEFAULT_WEBSITE_CONTENT.home,
      title: "Persistent homepage title",
    };
    const branding = {
      ...DEFAULT_WEBSITE_CONTENT.branding,
      siteName: "Persistent GoldVaults",
    };

    await Promise.all([
      saveWebsiteHome(home),
      saveWebsiteBranding(branding),
    ]);

    const saved = await getWebsiteContent();
    expect(saved.home.title).toBe(home.title);
    expect(saved.branding.siteName).toBe(branding.siteName);
  });
});
