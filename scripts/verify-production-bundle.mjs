import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const defaultBundlePath = fileURLToPath(
  new URL("../dist/index.js", import.meta.url)
);
const bundlePath = path.resolve(process.argv[2] ?? defaultBundlePath);
const bundle = fs.readFileSync(bundlePath, "utf8");
const developmentPackages = [
  "vite",
  "@vitejs/plugin-react",
  "@tailwindcss/vite",
  "vite-plugin-manus-runtime",
];

const escapeRegExp = value => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const staticImports = developmentPackages.filter(packageName => {
  const escaped = escapeRegExp(packageName);
  return (
    new RegExp(`\\bfrom\\s*["']${escaped}["']`).test(bundle) ||
    new RegExp(`\\bimport\\s*["']${escaped}["']`).test(bundle)
  );
});

if (staticImports.length > 0) {
  throw new Error(
    `Production bundle statically imports development packages: ${staticImports.join(", ")}`
  );
}

console.log("Production bundle has no static Vite dependencies");
