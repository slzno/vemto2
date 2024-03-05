const Path = require("path")
const Chalk = require("chalk")
const FileSystem = require("fs")
const Vite = require("vite")
const compileTs = require("./private/tsc")

async function buildRenderer() {
    console.log(Chalk.blueBright("Building renderer..."))

    return await Vite.build({
        configFile: Path.join(__dirname, "..", "vite.config.js"),
        base: "./",
        mode: "production",
    })
}

async function buildMain() {
    console.log(Chalk.blueBright("Building main..."))

    const mainPath = Path.join(__dirname, "..", "src", "main")
    return await compileTs(mainPath)
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
}).catch((error) => {
    console.log(
        Chalk.redBright(
            "An error occurred while transpiling renderer & main: " + error
        )
    )
})
