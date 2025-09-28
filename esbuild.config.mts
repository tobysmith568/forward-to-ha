import esbuild from "esbuild";

esbuild
  .build({
    entryPoints: ["src/index.ts"],
    bundle: true,
    platform: "node",
    format: "esm",
    outfile: "dist/index.mjs",
    packages: "bundle"
  })
  .catch(() => process.exit(1));
