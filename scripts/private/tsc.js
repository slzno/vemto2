const ChildProcess = require("child_process")
const Chalk = require("chalk")

function compile(directory, fast = false) {
    if(fast) console.log(Chalk.yellowBright("Fast mode enabled"))

    const fastParams = fast ? "--skipLibCheck" : ""

    return new Promise((resolve, reject) => {
        const tscProcess = ChildProcess.exec(`tsc ${fastParams} --project tsconfig.json && tsc-alias -p tsconfig.json`, {
            cwd: directory,
        })

        tscProcess.stdout.on("data", (data) =>
            process.stdout.write(
                Chalk.yellowBright(`[tsc] `) + Chalk.white(data.toString())
            )
        )

        tscProcess.stderr.on("data", (data) =>
            process.stderr.write(
                Chalk.redBright(`[tsc] `) + Chalk.white(data.toString())
            )
        )

        tscProcess.on("exit", (exitCode) => {
            if (exitCode > 0) {
                reject(exitCode)
            } else {
                console.log("Exit code: " + exitCode + " - tsc success")
                resolve()
            }
        })
    })
}

module.exports = compile
