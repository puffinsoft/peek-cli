import { defineConfig } from "tsup";
import { createRequire } from "module";
const { version } = createRequire(import.meta.url)("./package.json");

export default defineConfig({
    entry: ["index.ts", "server.ts"],
    outDir: "dist",
    format: ["esm"],
    target: "es2022",
    platform: "node",
    bundle: false,
    clean: true,
    dts: false,
    define: { __VERSION__: JSON.stringify(version) },
});
