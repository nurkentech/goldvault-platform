import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const signupModal = readFileSync(
  resolve(process.cwd(), "client/src/components/SignUpModal.tsx"),
  "utf8",
);
const adminLogin = readFileSync(
  resolve(process.cwd(), "client/src/pages/admin/AdminLogin.tsx"),
  "utf8",
);
const adminLayout = readFileSync(
  resolve(process.cwd(), "client/src/components/AdminDashboardLayout.tsx"),
  "utf8",
);
const context = readFileSync(
  resolve(process.cwd(), "server/_core/context.ts"),
  "utf8",
);

describe("two-factor login UI", () => {
  it("routes pending user sessions to the second-factor screen", () => {
    expect(signupModal).toContain("verification.requiresTwoFactor");
    expect(signupModal).toContain('navigate("/verify-2fa")');
    expect(signupModal.indexOf("verification.requiresTwoFactor")).toBeLessThan(
      signupModal.indexOf("await requireAuthenticatedSession()"),
    );
  });

  it("refreshes the admin identity before opening protected admin pages", () => {
    expect(adminLogin).toContain("await utils.adminAuth.me.invalidate()");
    expect(adminLogin).toContain("await utils.adminAuth.me.fetch()");
    expect(adminLayout).toContain('refetchOnMount: "always"');
    expect(adminLayout).toContain("!isFetching && !adminUser");
  });

  it("never promotes a pre-2FA token into an admin session", () => {
    expect(context).toContain("payload?.isAdmin && !payload.pre2fa");
  });
});
