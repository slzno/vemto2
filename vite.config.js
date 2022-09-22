import Path from "path";
import vuePlugin from "@vitejs/plugin-vue";

import { defineConfig } from "vite";
import checker from 'vite-plugin-checker';
import { fileURLToPath, URL } from "node:url";

/**
 * https://vitejs.dev/config
 */
export default defineConfig({
  root: Path.join(__dirname, "src", "renderer"),
  publicDir: "public",
  server: {
    port: 8080,
  },
  open: false,
  build: {
    outDir: Path.join(__dirname, "build", "renderer"),
    emptyOutDir: true,
  },
  plugins: [
    vuePlugin(),
    checker({
        typescript: true,
        eslint: {
            lintCommand: 'eslint "./**/*.{vue,js,jsx,cjs,mjs,ts,tsx,cts,mts}"',
        },
        vueTsc: true,
    }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src/renderer", import.meta.url)),
    },
  },
});
