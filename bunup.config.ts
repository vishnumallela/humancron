import { defineConfig } from "bunup";

export default defineConfig({
  entry: "index.ts",
  outDir: "dist",
  format: ["esm", "cjs"],
  target: "node",
  dts: true,
  sourcemap: "linked",
  shims: true,       // auto-handles __dirname/import.meta.url across ESM+CJS
  clean: true,       // wipe dist before every build — no stale files
  exports: {
    includePackageJson: true,
  },
  report: {
    gzip: true,
    brotli: false,
  },
});