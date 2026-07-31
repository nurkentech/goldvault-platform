import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const read = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");
const home = read("client/src/pages/Home.tsx");
const socialHub = read("client/src/components/SocialHub.tsx");
const miningExplorer = read("client/src/components/GoldMiningPartners.tsx");
const platformPages = read("client/src/pages/PlatformToolPages.tsx");
const app = read("client/src/App.tsx");
const footer = read("client/src/components/BottomSections.tsx");
const pageLayout = read("client/src/components/PageLayout.tsx");

describe("public platform tools", () => {
  it("keeps every displayed platform tab connected to a usable destination", () => {
    const destinations = [
      "/dashboard",
      "/dashboard/wallets",
      "/dashboard/exchange",
      "/dashboard/withdraw",
      "/mining-partners",
      "/social",
      "/dashboard/rewards",
      "/mint",
      "/dashboard/cards",
    ];

    expect(home).toContain("Live tool available");
    for (const destination of destinations) {
      expect(home).toContain(`href: "${destination}"`);
    }
  });

  it("keeps FAQ and informational material out of the interactive tool tabs", () => {
    expect(home).not.toContain('id: "faq"');
    expect(home).not.toContain("<FAQSection");
    expect(home).not.toContain("<TrustCredibility");
    expect(home).not.toContain("<TechnicalArchitecture");
    expect(footer).toContain('{ label: "FAQ", href: "/faq" }');
  });

  it("uses the persisted community API instead of fabricated social activity", () => {
    expect(socialHub).toContain("useCommunityFeed(30)");
    expect(socialHub).toContain("useCreatePost()");
    expect(socialHub).toContain("Real posts from GoldVaults members");
    expect(socialHub).not.toContain("MESSAGES_BY_FRIEND");
    expect(socialHub).not.toContain("const FRIENDS");
  });

  it("presents mining companies as research, not unsupported partners or returns", () => {
    expect(miningExplorer).toContain("Gold Mining Company Explorer");
    expect(miningExplorer).toContain("not a statement that these companies partner");
    expect(miningExplorer).toContain('target="_blank"');
    expect(miningExplorer).not.toContain("directly integrated");
    expect(miningExplorer).not.toContain("yieldShare");
  });

  it("registers dedicated Social Hub and Mining Explorer pages", () => {
    expect(platformPages).toContain("export function MiningExplorerPage");
    expect(platformPages).toContain("export function CommunitySocialPage");
    expect(app).toContain('path="/mining-partners" component={MiningExplorerPage}');
    expect(app).toContain('path="/social" component={CommunitySocialPage}');
  });

  it("does not advertise unverified certifications or insurance in page chrome", () => {
    expect(pageLayout).not.toContain("SEC Registered");
    expect(pageLayout).not.toContain("FCA Authorized");
    expect(pageLayout).not.toContain("$500M Insurance Fund");
    expect(pageLayout).toContain('href="/contact"');
  });
});
