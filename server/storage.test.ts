import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { ENV } from "./_core/env";
import { storagePut } from "./storage";

const originalUploadDir = process.env.GOLDVAULT_UPLOAD_DIR;
const originalForgeUrl = ENV.forgeApiUrl;
const originalForgeKey = ENV.forgeApiKey;
const temporaryDirectories: string[] = [];

afterEach(async () => {
  if (originalUploadDir === undefined) delete process.env.GOLDVAULT_UPLOAD_DIR;
  else process.env.GOLDVAULT_UPLOAD_DIR = originalUploadDir;
  ENV.forgeApiUrl = originalForgeUrl;
  ENV.forgeApiKey = originalForgeKey;
  await Promise.all(temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })));
});

describe("self-hosted CMS storage", () => {
  it("stores public CMS images in the persistent local upload directory", async () => {
    const uploadRoot = await mkdtemp(path.join(tmpdir(), "goldvault-cms-"));
    temporaryDirectories.push(uploadRoot);
    process.env.GOLDVAULT_UPLOAD_DIR = uploadRoot;
    ENV.forgeApiUrl = "";
    ENV.forgeApiKey = "";

    const uploaded = await storagePut(
      "cms/branding/banner.png",
      Buffer.from("banner-image"),
      "image/png",
    );

    expect(uploaded.url).toMatch(/^\/uploads\/cms\/branding\/banner_[a-f0-9]{8}\.png$/);
    await expect(readFile(path.join(uploadRoot, uploaded.key), "utf8")).resolves.toBe("banner-image");
  });

  it("does not expose private uploads when Forge storage is unavailable", async () => {
    const uploadRoot = await mkdtemp(path.join(tmpdir(), "goldvault-cms-"));
    temporaryDirectories.push(uploadRoot);
    process.env.GOLDVAULT_UPLOAD_DIR = uploadRoot;
    ENV.forgeApiUrl = "";
    ENV.forgeApiKey = "";

    await expect(storagePut("kyc/id.png", Buffer.from("private"), "image/png"))
      .rejects.toThrow("Private storage is not configured");
  });
});
