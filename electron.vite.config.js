import Path from "path"
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import vuePlugin from "@vitejs/plugin-vue"
import { fileURLToPath, URL } from "node:url"

// electron.vite.config.js
export default defineConfig({
    preload: {
        root: Path.join(__dirname, "src", "main"),
        build: {
            minify: true,
            outDir: Path.join(__dirname, "build", "src", "main"),

            lib: {
                entry: Path.join(__dirname, "src", "main", "preload.ts"),
                formats: ["cjs"],
            },    
        },
    },
    main: {
        root: Path.join(__dirname, "src", "main"),
        build: {
            minify: true,
            outDir: Path.join(__dirname, "build", "src", "main"),
            emptyOutDir: true,
            rollupOptions: {
                external: ["fsevents"]
            }
        },

        rollupOptions: {
            // inlineDynamicImports: true,
            ignoreDynamicRequires: true,
        },
        
        plugins: [externalizeDepsPlugin({
            exclude: [
                "shell-path",
                "@tiago_silva_pereira/reladb",
                "@tiago_silva_pereira/vemto-template-engine",
            ],
        })],

        resolve: {
            alias: {
                "@Main": fileURLToPath(new URL("./src/main", import.meta.url)),
    
                "@Renderer": fileURLToPath(
                    new URL("./src/renderer", import.meta.url)
                ),
    
                "@Common": fileURLToPath(new URL("./src/common", import.meta.url)),
    
                "@Tests": fileURLToPath(new URL("./tests", import.meta.url)),
            },
        },
    },

    renderer: {
        root: Path.join(__dirname, "src", "renderer"),
        publicDir: "public",
        server: {
            port: 8080,
        },
        open: false,
        build: {
            minify: true,
            outDir: Path.join(__dirname, "build", "renderer"),
            emptyOutDir: true,
        },
        plugins: [vuePlugin()],
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
    }
})
