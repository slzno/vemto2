module.exports = {
    presets: [
        ["@babel/preset-env", { targets: { node: "current" } }],
        "@babel/preset-typescript",
    ],

    plugins: [
        [
            "module-resolver",
            {
                root: ["."],
                alias: {
                    "@Tests": "./tests",
                    "@Src": "./src",
                    "@Common": "./src/common",
                    "@Models": "./src/common/models",
                    "@Main": "./src/main",
                    "@Renderer": "./src/renderer",
                },
            },
        ],
    ],
}
