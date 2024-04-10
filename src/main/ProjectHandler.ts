import { BrowserWindow, ipcMain } from "electron"
import watcher from "@parcel/watcher"
import { handleError } from "./ErrorHandler"
import ProjectPathResolver from "@Common/services/ProjectPathResolver"

export default class ProjectHandler {

    static window: BrowserWindow
    static watcherSubscription: any
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

        ProjectHandler.watcherSubscription = await watcher.subscribe(ProjectPathResolver.getPath(), (err, events) => {
            if (err) {
                console.error(err)
                return
            }

            if (!events.length) return

            const allChangedFiles = events.map((event: any) => event.path),
                allNotIgnoredFiles = allChangedFiles.filter((path: string) => !ProjectHandler.isIgnoredPath(path))

            if (!allNotIgnoredFiles.length) {
                return
            }

            console.log('File change detected')

            ProjectHandler.window.webContents.send("files:changed", {
                files: allNotIgnoredFiles
            })
        })
    }

    static async close() {
        ProjectHandler.projectIsOpen = false

        if (ProjectHandler.watcherSubscription) {
            console.log('Closing previous watcher subscription...')
            await ProjectHandler.watcherSubscription.unsubscribe(
                ProjectPathResolver.getPath()
            )
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
