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
const verifyTwoFactor = readFileSync(
  resolve(process.cwd(), "client/src/pages/VerifyTwoFactor.tsx"),
  "utf8",
);
const userTwoFactor = readFileSync(
  resolve(process.cwd(), "server/userTwoFactor.ts"),
  "utf8",
);
const userSessions = readFileSync(
  resolve(process.cwd(), "server/userSessions.ts"),
  "utf8",
);

describe("two-factor login UI", () => {
  it("routes pending user sessions to the second-factor screen", () => {
    expect(signupModal).toContain("verification.requiresTwoFactor");
    expect(signupModal).toContain(
      "`/verify-2fa?returnPath=${encodeURIComponent(successPath)}`",
    );
    expect(signupModal).not.toContain(
      'await utils.auth.me.invalidate();\n        toast.info("Complete two-factor',
    );
    expect(signupModal.indexOf("verification.requiresTwoFactor")).toBeLessThan(
      signupModal.indexOf("await requireAuthenticatedSession()"),
    );
  });

  it("keeps the modal sign-in mode synchronized and uses a hard authenticated redirect", () => {
    expect(signupModal).toContain("if (isOpen) setMode(initialMode)");
    expect(signupModal).toContain("window.location.replace(successPath)");
  });

  it("confirms the authenticated session before leaving two-factor verification", () => {
    expect(verifyTwoFactor).toContain("await utils.auth.me.fetch()");
    expect(verifyTwoFactor).toContain("window.location.replace(returnPath)");
    expect(verifyTwoFactor).toContain("This verification session has expired");
    expect(userTwoFactor).toContain("if (!sessionVerified)");
    expect(userSessions).toContain("Promise<boolean>");
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
