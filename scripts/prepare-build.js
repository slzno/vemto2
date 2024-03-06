process.env.NODE_ENV = "development"

const Path = require("path")
const { sync: rimrafSync } = require("rimraf")

start()

function start() {
    // Remove the build directory
    rimrafSync(Path.join(__dirname, "..", "build"))
}
