// Public CMS images use Forge/S3 when configured. On self-hosted production
// (including Namecheap), CMS images fall back to a persistent local directory.
// Private uploads still require Forge so they are never exposed accidentally.

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { ENV } from "./_core/env";

function getForgeConfig() {
  const forgeUrl = ENV.forgeApiUrl;
  const forgeKey = ENV.forgeApiKey;

  if (!forgeUrl || !forgeKey) return null;

  return { forgeUrl: forgeUrl.replace(/\/+$/, ""), forgeKey };
}

function normalizeKey(relKey: string): string {
  const key = relKey.replace(/\\/g, "/").replace(/^\/+/, "");
  if (!key || key.split("/").some((segment) => !segment || segment === "." || segment === "..")) {
    throw new Error("Invalid storage key");
  }
  if (!/^[A-Za-z0-9][A-Za-z0-9/_.-]*$/.test(key)) {
    throw new Error("Invalid storage key");
  }
  return key;
}

function appendHashSuffix(relKey: string): string {
  const hash = crypto.randomUUID().replace(/-/g, "").slice(0, 8);
  const lastDot = relKey.lastIndexOf(".");
  if (lastDot === -1) return `${relKey}_${hash}`;
  return `${relKey.slice(0, lastDot)}_${hash}${relKey.slice(lastDot)}`;
}

export function getLocalPublicUploadRoot(): string {
  const configured = process.env.GOLDVAULT_UPLOAD_DIR?.trim();
  if (configured) return path.resolve(configured);

  // cPanel runs the application with HOME=/home/<account>. Keeping uploads
  // outside versioned releases ensures banner and blog images survive deploys.
  if (ENV.isProduction && process.env.HOME) {
    return path.resolve(process.env.HOME, "goldvault-app", "uploads");
  }

  return path.resolve(process.cwd(), "uploads");
}

function publicUploadUrl(key: string): string {
  return `/uploads/${key.split("/").map(encodeURIComponent).join("/")}`;
}

async function putLocalCmsAsset(
  key: string,
  data: Buffer | Uint8Array | string,
): Promise<{ key: string; url: string }> {
  if (!key.startsWith("cms/")) {
    throw new Error(
      "Private storage is not configured. Set BUILT_IN_FORGE_API_URL and BUILT_IN_FORGE_API_KEY",
    );
  }

  const root = getLocalPublicUploadRoot();
  const destination = path.resolve(root, ...key.split("/"));
  if (!destination.startsWith(`${root}${path.sep}`)) {
    throw new Error("Invalid storage destination");
  }

  await mkdir(path.dirname(destination), { recursive: true });
  const payload = typeof data === "string" ? Buffer.from(data) : Buffer.from(data);
  await writeFile(destination, payload, { flag: "wx" });
  return { key, url: publicUploadUrl(key) };
}

export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream",
): Promise<{ key: string; url: string }> {
  const key = appendHashSuffix(normalizeKey(relKey));
  const forgeConfig = getForgeConfig();
  if (!forgeConfig) return putLocalCmsAsset(key, data);
  const { forgeUrl, forgeKey } = forgeConfig;

  // 1. Get presigned PUT URL from Forge
  const presignUrl = new URL("v1/storage/presign/put", forgeUrl + "/");
  presignUrl.searchParams.set("path", key);

  const presignResp = await fetch(presignUrl, {
    headers: { Authorization: `Bearer ${forgeKey}` },
  });

  if (!presignResp.ok) {
    const msg = await presignResp.text().catch(() => presignResp.statusText);
    throw new Error(`Storage presign failed (${presignResp.status}): ${msg}`);
  }

  const { url: s3Url } = (await presignResp.json()) as { url: string };
  if (!s3Url) throw new Error("Forge returned empty presign URL");

  // 2. PUT file directly to S3
  const blob =
    typeof data === "string"
      ? new Blob([data], { type: contentType })
      : new Blob([data as any], { type: contentType });

  const uploadResp = await fetch(s3Url, {
    method: "PUT",
    headers: { "Content-Type": contentType },
    body: blob,
  });

  if (!uploadResp.ok) {
    throw new Error(`Storage upload to S3 failed (${uploadResp.status})`);
  }

  return { key, url: `/manus-storage/${key}` };
}

export async function storageGet(relKey: string): Promise<{ key: string; url: string }> {
  const key = normalizeKey(relKey);
  if (!getForgeConfig() && key.startsWith("cms/")) {
    return { key, url: publicUploadUrl(key) };
  }
  return { key, url: `/manus-storage/${key}` };
}

export async function storageGetSignedUrl(relKey: string): Promise<string> {
  const key = normalizeKey(relKey);
  const forgeConfig = getForgeConfig();
  if (!forgeConfig) {
    if (key.startsWith("cms/")) return publicUploadUrl(key);
    throw new Error(
      "Private storage is not configured. Set BUILT_IN_FORGE_API_URL and BUILT_IN_FORGE_API_KEY",
    );
  }
  const { forgeUrl, forgeKey } = forgeConfig;

  const getUrl = new URL("v1/storage/presign/get", forgeUrl + "/");
  getUrl.searchParams.set("path", key);

  const resp = await fetch(getUrl, {
    headers: { Authorization: `Bearer ${forgeKey}` },
  });

  if (!resp.ok) {
    const msg = await resp.text().catch(() => resp.statusText);
    throw new Error(`Storage signed URL failed (${resp.status}): ${msg}`);
  }

  const { url } = (await resp.json()) as { url: string };
  return url;
}
