process.env.NODE_ENV = "development"

const Path = require("path")
const Chalk = require("chalk")
const FileSystem = require("fs")
const ChildProcess = require("child_process")

start()

function start() {
    console.log(
        `${Chalk.greenBright("=======================================")}`
    )
    console.log(
        `${Chalk.greenBright("Compiling PHP tools...")}`
    )
    console.log(
        `${Chalk.greenBright("=======================================")}`
    )
    
    copy("static")

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