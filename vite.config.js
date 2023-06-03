import Path from "path"
import vuePlugin from "@vitejs/plugin-vue"

import { defineConfig } from "vite"
import checker from "vite-plugin-checker"
import { fileURLToPath, URL } from "node:url"

let plugins = [vuePlugin()]

if (process.env.NODE_ENV === "development" && !process.env.VEMTO_NO_CHECKERS) {
    // Will execute only inside ./src/renderer
    plugins.push(
        checker({
            typescript: true,
            eslint: {
                lintCommand:
                    "eslint . --ext .vue,.js,.jsx,.cjs,.mjs,.ts,.tsx,.cts,.mts",
            },
            vueTsc: true,
        })
    )
}

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
    plugins: plugins,
    resolve: {
        alias: {
            vue: 'vue/dist/vue.esm-bundler.js',
            
            "@Main": fileURLToPath(new URL("./src/main", import.meta.url)),

            "@Renderer": fileURLToPath(
                new URL("./src/renderer", import.meta.url)
            ),

            "@Common": fileURLToPath(new URL("./src/common", import.meta.url)),

            "@Tests": fileURLToPath(new URL("./tests", import.meta.url)),
        },
    },
})
