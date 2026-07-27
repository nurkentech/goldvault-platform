import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const premiumNav = readFileSync(
  resolve(process.cwd(), "client/src/components/PremiumNav.tsx"),
  "utf8",
);
const dashboardLayout = readFileSync(
  resolve(process.cwd(), "client/src/components/UserDashboardLayout.tsx"),
  "utf8",
);

describe("responsive mobile navigation", () => {
  it("keeps the public menu within the viewport and exposes expandable submenus", () => {
    expect(premiumNav).toContain('aria-controls="mobile-navigation"');
    expect(premiumNav).toContain("max-h-[calc(100dvh-4rem)]");
    expect(premiumNav).toContain("overflow-y-auto");
    expect(premiumNav).toContain("mobileSection === link.label");
    expect(premiumNav).toContain("min-h-11");
  });

  it("keeps the dashboard drawer usable independently of desktop collapse state", () => {
    expect(dashboardLayout).toContain("w-[min(20rem,85vw)]");
    expect(dashboardLayout).toContain("sidebarOpen || mobileMenuOpen");
    expect(dashboardLayout).toContain('aria-label="Close navigation menu"');
    expect(dashboardLayout).toContain("setMobileMenuOpen(false)");
  });
});
