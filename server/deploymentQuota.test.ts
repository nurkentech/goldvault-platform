import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const workflow = readFileSync(
  resolve(process.cwd(), ".github/workflows/deploy-production.yml"),
  "utf8",
);
const cleanup = readFileSync(
  resolve(process.cwd(), "scripts/prepare-release-directory.sh"),
  "utf8",
);

describe("production release storage cleanup", () => {
  it("runs the guarded cleanup before uploading a release", () => {
    const prepareIndex = workflow.indexOf("- name: Prepare release directory");
    const uploadIndex = workflow.indexOf("- name: Upload release");

    expect(prepareIndex).toBeGreaterThan(0);
    expect(uploadIndex).toBeGreaterThan(prepareIndex);
    expect(workflow).toContain("< scripts/prepare-release-directory.sh");
  });

  it("restricts cleanup to the release directory and preserves the live target", () => {
    expect(cleanup).toContain("/home/*/goldvault-app");
    expect(cleanup).toContain('if [ ! -L "${current_link}" ]');
    expect(cleanup).toContain('"${releases_root}/"*');
    expect(cleanup).toContain('if [ "${candidate_dir}" = "${current_dir}" ]');
    expect(cleanup).toContain('rm -rf -- "${candidate}"');
  });

  it("rejects malformed release identifiers", () => {
    expect(cleanup).toContain('*[!0-9a-f]* | ""');
  });
});
