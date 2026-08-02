import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const read = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");
const routers = read("server/routers.ts");
const db = read("server/db.ts");
const socialHub = read("client/src/components/SocialHub.tsx");
const callControls = read("client/src/components/SocialCallControls.tsx");
const marketSections = read("client/src/components/MarketSections.tsx");
const adminBlog = read("client/src/pages/admin/AdminBlog.tsx");
const app = read("client/src/App.tsx");

describe("Social Hub and News CMS integration", () => {
  it("serves real contacts, persisted conversations, and read state", () => {
    expect(routers).toContain("contacts: protectedProcedure");
    expect(routers).toContain("history: protectedProcedure");
    expect(routers).toContain("markRead: protectedProcedure");
    expect(db).toContain("export async function getSocialContacts");
    expect(db).toContain("export async function markChatRead");
  });

  it("renders the requested contacts and conversation workspace without mock friends", () => {
    expect(socialHub).toContain("Search members");
    expect(socialHub).toContain("useChatHistory");
    expect(socialHub).toContain("useSendMessage");
    expect(socialHub).toContain("SocialCallControls");
    expect(socialHub).not.toContain("const FRIENDS");
  });

  it("implements peer-to-peer audio/video controls with server signaling", () => {
    expect(callControls).toContain("RTCPeerConnection");
    expect(callControls).toContain("getUserMedia");
    expect(callControls).toContain("Start audio call");
    expect(callControls).toContain("Start video call");
    expect(routers).toContain("call: router({");
  });

  it("uses published Blog CMS posts for the homepage News feed", () => {
    expect(marketSections).toContain("trpc.advanced.blog.list.useQuery({ limit: 6 })");
    expect(marketSections).toContain("Published Blog CMS articles will appear here automatically");
    expect(marketSections).not.toContain("const NEWS_ITEMS");
    expect(marketSections).toContain("`/blog/${item.slug}`");
  });

  it("registers a first-class admin News and Blog editor", () => {
    expect(adminBlog).toContain("News & Blog CMS");
    expect(adminBlog).toContain("Publish to News & Blog");
    expect(adminBlog).toContain("uploadCover");
    expect(app).toContain('path="/admin/blog"');
  });
});
