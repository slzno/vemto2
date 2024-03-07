process.env.NODE_ENV = "development"

const Vite = require("vite")
const ChildProcess = require("child_process")
const Path = require("path")
const Chalk = require("chalk")
const Chokidar = require("chokidar")
const Electron = require("electron")
const compileTs = require("./private/tsc")
const FileSystem = require("fs")
const { sync: rimrafSync } = require("rimraf")

let viteServer = null
let electronProcess = null
let electronProcessLocker = false
let rendererPort = 0

async function startRenderer() {
    try {
        viteServer = await Vite.createServer({
            configFile: Path.join(__dirname, "..", "vite.config.js"),
            mode: "development",
        })
    
        return viteServer.listen()
    } catch (error) {
        console.log(Chalk.redBright(error))
        process.exit(1)
    }
}

async function startElectron() {
    if (electronProcess) {
        // single instance lock
        return
    }

    try {
        console.log("Is fast mode enabled? ", !! process.env.VEMTO_FAST_MODE)
        await compileTs(Path.join(__dirname, "..", "src", "main"), !! process.env.VEMTO_FAST_MODE)
    } catch {
        console.log(
            Chalk.redBright(
                "Could not start Electron because of the above typescript error(s)."
            )
        )
        electronProcessLocker = false
        return
    }

    const args = [
        Path.join(__dirname, "..", "build", "src", "main", "main.js"),
        rendererPort,
    ]
    electronProcess = ChildProcess.spawn(Electron, args)
    electronProcessLocker = false

    electronProcess.stdout.on("data", (data) =>
        process.stdout.write(
            Chalk.blueBright(`[electron] `) + Chalk.white(data.toString())
        )
    )

    electronProcess.stderr.on("data", (data) =>
        process.stderr.write(
            Chalk.blueBright(`[electron] `) + Chalk.white(data.toString())
        )
    )

    electronProcess.on("exit", () => stop())
}

function restartElectron() {
    if (electronProcess) {
        electronProcess.removeAllListeners("exit")
        electronProcess.kill()
        electronProcess = null
    }

    if (!electronProcessLocker) {
        electronProcessLocker = true
        startElectron()
    }
}

function copyStaticFiles() {
    copy("static")
}

/*
The working dir of Electron is build/main instead of src/main because of TS.
tsc does not copy static files, so copy them over manually for dev server.
*/
function copy(path) {
    FileSystem.cpSync(
        Path.join(__dirname, "..", "src", "main", path),
        Path.join(__dirname, "..", "build", "src", "main", path),
        { recursive: true }
    )
}

function stop() {
    viteServer.close()
    process.exit()
}

async function start() {
    console.log(
        `${Chalk.greenBright("=======================================")}`
    )
    console.log(
        `${Chalk.greenBright("Starting Electron + Vite Dev Server...")}`
    )
    console.log(
        `${Chalk.greenBright("=======================================")}`
    )

    if(rimrafSync(Path.join(__dirname, "..", "build"))) {
        console.log(Chalk.greenBright("Build folder deleted."))

        ChildProcess.exec("yarn php:compile", {
            cwd: Path.join(__dirname, ".."),
        }, (error, stdout, stderr) => {
            if (error) {
                console.log(Chalk.redBright(error))
                process.exit(1)
            }
    
            if (stderr) {
                console.log(Chalk.redBright(stderr))
                process.exit(1)
            }
    
            console.log(Chalk.greenBright(stdout))
        })
    }

    const devServer = await startRenderer()
    rendererPort = devServer.config.server.port

    console.log(`Using port ${rendererPort} for renderer process.`)

    copyStaticFiles()
    startElectron()

    const path = Path.join(__dirname, "..", "src", "main")
    Chokidar.watch(path, {
        cwd: path,
        ignored: [
            Path.join(path, "static"),
        ],
    }).on("change", (path) => {
        console.log(
            Chalk.blueBright(`[electron] `) +
                `Change in ${path}. Reloading... 🚀`
        )

        if (path.startsWith(Path.join("static", "/"))) {
            copy(path)
        }

        restartElectron()
    })

    // Watch for common models files
    const modelsPath = Path.join(__dirname, "..", "src", "common", "models")
    Chokidar.watch(modelsPath, {
        cwd: modelsPath,
    }).on("change", (path) => {
        console.log(
            Chalk.blueBright(`[electron] `) +
                `Change in ${path}. Reloading... 🚀`
        )

        restartElectron()
    })

    // Watch for static files
    const staticPath = Path.join(__dirname, "..", "src", "main", "static")
    Chokidar.watch(staticPath, {
        cwd: staticPath,
    }).on("change", (path) => {
        console.log(
            Chalk.blueBright(`[electron] `) +
                `Change in ${path}. Copying static files... 🚀`
        )

        copyStaticFiles()
    })

    // Whatch PHP files
    const phpPath = Path.join(__dirname, "..", "src", "php"),
        appsSettings = FileSystem.readFileSync(Path.join(phpPath, "compiler.json")),
        apps = JSON.parse(appsSettings).apps

    let appsIgnoredPaths = []
    Object.keys(apps).forEach(app => { 
        appsIgnoredPaths.push(Path.join(phpPath, "apps", app, "common"))
    })

    Chokidar.watch(phpPath, {
        cwd: phpPath,
        ignored: [
            Path.join(phpPath, "dist"),
            ...appsIgnoredPaths
        ],
    }).on("change", (path) => {
        console.log(
            Chalk.magentaBright(`[php] `) +
                `Change in ${path}. Compiling PHP... 🚀`
        )
        
        ChildProcess.exec("yarn php:compile", {
            cwd: Path.join(__dirname, ".."),
        })
    })
}

start()
