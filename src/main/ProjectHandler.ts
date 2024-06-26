import chokidar from "chokidar"
import { BrowserWindow, ipcMain } from "electron"
import { handleError } from "./ErrorHandler"
import ProjectPathResolver from "@Common/services/ProjectPathResolver"

export default class ProjectHandler {

    static watcher: any
    static window: BrowserWindow
    static projectIsOpen: boolean = false

    static init(window: BrowserWindow) {
        ProjectHandler.window = window
    }

    static handle() {
        ipcMain.handle("prepare:project", async (event, projectPath) => {
            return handleError(event, async () => {
                console.log('Preparing project...')
    
                ProjectPathResolver.setPath(projectPath)
                
                await ProjectHandler.open()
    
                console.log('Project path set to:', projectPath)
            })
        })
    }

    static async open() {
        console.log('Opening project...')

        ProjectHandler.close()

        ProjectHandler.projectIsOpen = true

        console.log('START: Starting watcher...')

        ProjectHandler.watcher = chokidar
            .watch(ProjectPathResolver.getPath(), {
                ignoreInitial: true,
                ignored: [
                    /(^|[\/\\])\../,
                    /node_modules/,
                    /vendor/,
                    /vemto\.log/
                ]
            })
            .on("change", (event) => {
                ProjectHandler.window.webContents.send("files:changed", {
                    file: event
                })
            })
            .on("add", (event) => {
                ProjectHandler.window.webContents.send("files:changed", {
                    file: event
                })
            })
            .on("unlink", (event) => {
                ProjectHandler.window.webContents.send("files:changed", {
                    file: event
                })
            })

    }

    static async close() {
        ProjectHandler.projectIsOpen = false

        if (ProjectHandler.watcher) {
            console.log('Closing previous watcher subscription...')

            await ProjectHandler.watcher.close().then(() => {
                console.log('Watcher closed')
            })

            ProjectHandler.watcher = null
        }
    }

    static isOpen() {
        return ProjectHandler.projectIsOpen
    }

    static isIgnoredPath(path: string) {
        const ignoredPaths = [
            '.vemto',
            'vendor',
            'node_modules'
        ]

        return ignoredPaths.some((ignoredPath) => path.includes(ignoredPath))
    }

}
