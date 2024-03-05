const Path = require("path")
const Chalk = require("chalk")
const FileSystem = require("fs")
const Vite = require("vite")
const compileTs = require("./private/tsc")

function buildRenderer() {
    console.log(Chalk.blueBright("Building renderer..."))

    return Vite.build({
        configFile: Path.join(__dirname, "..", "vite.config.js"),
        base: "./",
        mode: "production",
    })
}

function buildMain() {
    console.log(Chalk.blueBright("Building main..."))
    
    const mainPath = Path.join(__dirname, "..", "src", "main")
    return compileTs(mainPath)
}

FileSystem.rmSync(Path.join(__dirname, "..", "build"), {
    recursive: true,
    force: true,
})

console.log(Chalk.blueBright("Transpiling renderer & main..."))

Promise.allSettled([buildRenderer(), buildMain()]).then(() => {
    console.log(
        Chalk.greenBright(
            "Renderer & main successfully transpiled! (ready to be built with electron-builder)"
        )
    )
})
