import { join } from "path"
import logger from "electron-log"
import ProjectHandler from "./ProjectHandler"
import { autoUpdater } from "electron-updater"
import { HandleDatabase } from "./DatabaseHandler"
import { HandleFileQueue } from "./FileQueueHandler"
import { app, BrowserWindow, session } from "electron"
import { HandleIpcMessages } from "./IpcMessagesHandler"
import installExtension from "electron-devtools-installer"
import { HandleRenderableFileQueue } from "./RenderableFileQueueHandler"
import Storage from "./services/Storage"

const isTesting = process.env.NODE_ENV === "test",
    isDevelopment = process.env.NODE_ENV === "development"

async function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 1320,
        height: 768,
        backgroundColor: "#0f172a",
        titleBarStyle: 'hidden',
        titleBarOverlay: {
            color: '#0f172a',
            symbolColor: '#ffffff',
            height: 30
        },
        webPreferences: {
            preload: join(__dirname, "preload.js"),
            nodeIntegration: false,
            contextIsolation: true,
            zoomFactor: 1,
            // devTools: true,
        },
    })

    Storage.setWindow(mainWindow)

    if (isDevelopment) {
        const rendererPort = process.argv[2]
        await mainWindow.loadURL(`http://localhost:${rendererPort}`)
        
        if (!process.env.VEMTO_NO_EXTENSIONS) await installExtension("nhdogjmejiglipccpnnnanhbledajbpd")

        if (process.env.VEMTO_HIDE_MENU) await mainWindow.setMenu(null)

        // await mainWindow.webContents.openDevTools()
    } else {
        mainWindow.setMenu(null)
        mainWindow.loadFile(join(app.getAppPath(), "renderer", "index.html"))

        autoUpdater.logger = logger
        autoUpdater.checkForUpdatesAndNotify()
    }

    mainWindow.maximize()

    ProjectHandler.init(mainWindow)

    ProjectHandler.handle()

    HandleDatabase()
    HandleFileQueue()

    HandleRenderableFileQueue(mainWindow)
}

app.whenReady().then(() => {
    HandleIpcMessages()
    
    createWindow()

    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
        callback({
            responseHeaders: {
                ...details.responseHeaders,
                "Content-Security-Policy": isDevelopment
                    ? ["default-src 'self' 'unsafe-eval' http: https: 'unsafe-inline'; img-src 'self' https://vemto.app data:"]
                    : ["script-src 'self' 'unsafe-eval' https://cdn.tailwindcss.com; img-src 'self' https://vemto.app data:"],
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