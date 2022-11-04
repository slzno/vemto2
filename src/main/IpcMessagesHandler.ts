import path from "path"
import { app, ipcMain } from "electron"
import FileSystem from "./base/FileSystem"
import { handleError } from "./ErrorHandler"
import Project from "../common/models/Project"
import PrepareProject from "./services/PrepareProject"
import ReadProjectSchema from "./services/ReadProjectSchema"

export function HandleIpcMessages() {
    ipcMain.handle("prepare:project", async (event, projectPath) => {
        return handleError(event, async () => {
            return await PrepareProject.run(projectPath)
        })
    })

    ipcMain.handle("get:project:schema", async (event, projectPath) => {
        return handleError(event, async () => {
            return await ReadProjectSchema.run(projectPath)
        })
    })

    ipcMain.handle("get:project:database", (event, projectPath) => {
        return handleError(event, () => {
            let databaseFilePath = path.join(projectPath, ".vemto", "data.json")
            let databaseData = FileSystem.readFileAsJsonIfExists(databaseFilePath)
            
            return databaseData
        })
    })

    ipcMain.handle("file:project:read", (event, filePath) => {
        const project = Project.find(1)
        if(!project) return null

        return handleError(event, () => {
            const completePath = path.join(project.getPath(), filePath)
            return FileSystem.readFile(completePath)
        })
    })

    ipcMain.handle("file:template:read", (event, filePath) => {
        const project = Project.find(1)
        if(!project) return null

        return handleError(event, () => {
            // const completePath = path.join(project.getPath(), ".vemto", "templates", filePath)

            // if(FileSystem.fileExists(completePath)) {
            //     return FileSystem.readFile(completePath)
            // }

            // If the file does not exist in the project, we try to read it from the static folder
            return FileSystem.readFile(path.join(app.getAppPath(), "static", "templates", filePath))
        })
    })
}
