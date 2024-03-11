process.env.NODE_ENV = "development"

const Path = require("path")
const { sync: rimrafSync } = require("rimraf")
const fs = require("fs")

start()

function start() {
    // Remove the build directory
    rimrafSync(Path.join(__dirname, "..", "build"))

    // Create the build directory
    fs.mkdirSync(Path.join(__dirname, "..", "build"))

    // Copy icon.png from buildResources to build
    fs.copyFileSync(
        Path.join(__dirname, "..", "buildResources", "icon.png"),
        Path.join(__dirname, "..", "build", "icon.png")
    )
}
