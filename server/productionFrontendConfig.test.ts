import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(import.meta.dirname, "..");
const read = (file: string) => fs.readFileSync(path.join(root, file), "utf8");

describe("production frontend configuration", () => {
  it("falls back to built-in login when external OAuth is unavailable", () => {
    const constants = read("client/src/const.ts");
    const authHook = read("client/src/_core/hooks/useAuth.ts");

    expect(constants).toContain("if (!oauthPortalUrl || !appId)");
    expect(constants).toContain('url.searchParams.set("auth", "login")');
    expect(authHook).not.toContain("redirectPath = getLoginUrl()");
  });

  it("loads analytics only when both settings are configured", () => {
    const html = read("client/index.html");
    const analytics = read("client/src/components/Analytics.tsx");

    expect(html).not.toContain("%VITE_ANALYTICS_");
    expect(analytics).toContain("if (!endpoint || !websiteId");
    expect(analytics).toContain("Ignoring invalid VITE_ANALYTICS_ENDPOINT");
  });
});
