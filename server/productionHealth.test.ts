import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const server = readFileSync(
  resolve(process.cwd(), "server/_core/index.ts"),
  "utf8",
);
const workflow = readFileSync(
  resolve(process.cwd(), ".github/workflows/deploy-production.yml"),
  "utf8",
);

describe("production health verification", () => {
  it("registers an unauthenticated health endpoint before request parsers", () => {
    const healthRoute = server.indexOf('app.get("/healthz"');
    const jsonParser = server.indexOf("app.use(express.json");

    expect(healthRoute).toBeGreaterThan(0);
    expect(jsonParser).toBeGreaterThan(healthRoute);
    expect(server).toContain('.send("ok")');
  });

  it("checks both the application probe and homepage from the hosting server", () => {
    expect(workflow).toContain(
      'ssh -p "${DEPLOY_PORT}" "${DEPLOY_USER}@${DEPLOY_HOST}"',
    );
    expect(workflow).toContain("https://goldvaults.us/healthz");
    expect(workflow).toContain('[ "${health_body}" = "ok" ]');
    expect(workflow).toContain("--dump-header -");
  });
});
