import path from "path"
import { ipcMain } from "electron"
import FileSystem from "./base/FileSystem"
import ReadProjectSchema from "./services/ReadProjectSchema"
import { handleError } from "./ErrorHandler"

export function HandleIpcMessages() {
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
}
