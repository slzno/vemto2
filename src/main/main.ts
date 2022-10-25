import { join } from "path"
import { HandleDatabase } from "./DatabaseHandler"
import { HandleIpcMessages } from "./IpcMessagesHandler"
import { app, BrowserWindow, session } from "electron"
import installExtension, { VUEJS3_DEVTOOLS } from "electron-devtools-installer"

const isTesting = process.env.NODE_ENV === "test",
    isDevelopment = process.env.NODE_ENV === "development"

HandleDatabase()
HandleIpcMessages()

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 1320,
        height: 768,
        titleBarStyle: 'hidden',
        titleBarOverlay: {
            color: '#0f172a',
            symbolColor: '#ffffff',
            height: 15
        },
        webPreferences: {
            preload: join(__dirname, "preload.js"),
            nodeIntegration: false,
            contextIsolation: true,
        },
    })

    if (isDevelopment) {
        const rendererPort = process.argv[2]
        mainWindow.loadURL(`http://localhost:${rendererPort}`)
        
        if (!process.env.VEMTO_NO_EXTENSIONS) installExtension(VUEJS3_DEVTOOLS)

        if (process.env.VEMTO_HIDE_MENU) mainWindow.setMenu(null)
    } else {
        mainWindow.setMenu(null)
        mainWindow.loadFile(join(app.getAppPath(), "renderer", "index.html"))
    }
}

app.whenReady().then(() => {
    createWindow()

    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
        callback({
            responseHeaders: {
                ...details.responseHeaders,
                "Content-Security-Policy": isDevelopment
                    ? ["default-src 'self' http: https: 'unsafe-inline'; img-src 'self' data:"]
                    : ["script-src 'self'; img-src 'self' data:"],
            },
        })
    })

    app.on("activate", function () {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })
})

app.on("window-all-closed", function () {
    if (process.platform !== "darwin") app.quit()
})