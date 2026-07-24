import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

describe("GoldVault AI Copilot interface", () => {
  it("replaces the scripted demo with typed API calls", () => {
    const widget = read("client/src/components/AIAssistantWidget.tsx");
    const panel = read("client/src/components/CopilotPanel.tsx");
    expect(widget).toContain("CopilotPanel");
    expect(panel).toContain("trpc.ai.ask.useMutation");
    expect(panel).toContain("trpc.ai.messages.useQuery");
    expect(panel).not.toContain("Simulate AI response");
    expect(panel).not.toContain("setTimeout(");
  });

  it("exposes user and human-review admin routes", () => {
    const app = read("client/src/App.tsx");
    const userNavigation = read("client/src/components/UserDashboardLayout.tsx");
    const adminNavigation = read("client/src/components/AdminDashboardLayout.tsx");
    expect(app).toContain('path="/dashboard/copilot"');
    expect(app).toContain('path="/admin/ai-copilot"');
    expect(userNavigation).toContain('"AI Copilot"');
    expect(adminNavigation).toContain('"AI Review Copilot"');
  });

  it("makes the read-only and human-review boundaries visible", () => {
    const panel = read("client/src/components/CopilotPanel.tsx");
    const admin = read("client/src/pages/admin/AdminAICopilot.tsx");
    expect(panel).toContain("Read-only");
    expect(panel).toContain("It cannot perform financial actions");
    expect(admin).toContain("Human approval required");
    expect(admin).toContain("AI output never sends replies");
  });
});
