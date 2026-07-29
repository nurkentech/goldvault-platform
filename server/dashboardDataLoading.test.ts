import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const read = (file: string) =>
  readFileSync(resolve(process.cwd(), file), "utf8");

const adminDatabase = read("server/adminDb.ts");
const authSdk = read("server/_core/sdk.ts");
const routers = read("server/routers.ts");
const adminLayout = read("client/src/components/AdminDashboardLayout.tsx");
const adminUsers = read("client/src/pages/admin/AdminUsers.tsx");
const adminDashboard = read("client/src/pages/admin/AdminDashboard.tsx");

describe("dashboard data loading", () => {
  it("parallelizes independent admin aggregates and user pagination queries", () => {
    const stats = adminDatabase.slice(
      adminDatabase.indexOf("export async function getPlatformStats"),
      adminDatabase.indexOf("//", adminDatabase.indexOf("export async function getPlatformStats") + 40),
    );
    const users = adminDatabase.slice(
      adminDatabase.indexOf("export async function getAllUsers"),
      adminDatabase.indexOf("export async function adminUpdateUser"),
    );

    expect(stats).toContain("Promise.all");
    expect(users).toContain("Promise.all");
  });

  it("does not expose user 2FA secrets in the admin list projection", () => {
    const users = adminDatabase.slice(
      adminDatabase.indexOf("export async function getAllUsers"),
      adminDatabase.indexOf("export async function adminUpdateUser"),
    );

    expect(users).toContain("id: users.id");
    expect(users).not.toContain("totpSecret");
    expect(users).not.toContain("twoFactorBackupCodes");
    expect(users).not.toContain("notifPrefs");
  });

  it("keeps routine authentication read-only and avoids repeated wallet writes", () => {
    const authentication = authSdk.slice(
      authSdk.indexOf("async authenticateRequest"),
      authSdk.indexOf("const CRON_OPEN_ID_PREFIX"),
    );
    const postValidation = authentication.slice(
      authentication.indexOf("validateUserSession"),
    );

    expect(postValidation).not.toContain("upsertUser");
    expect(routers).toContain("getOrInitUserWallets(ctx.user.id)");
    expect(routers).not.toContain("await initDefaultWallets(ctx.user.id)");
  });

  it("keeps cached admin identity visible and renders recoverable data errors", () => {
    expect(adminLayout).toContain(
      "if ((isLoading || isFetching) && !adminUser)",
    );
    expect(adminUsers).toContain("Users could not be loaded.");
    expect(adminUsers).toContain("setDebouncedSearch");
    expect(adminDashboard).toContain(
      "Some dashboard data could not be loaded.",
    );
    expect(adminDashboard).toContain("setLoadingTimedOut(true), 12_000");
  });
});
