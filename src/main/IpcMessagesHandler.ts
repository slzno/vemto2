import path from "path"
import { ipcMain } from "electron"
import FileSystem from "./base/FileSystem"
import ReadProjectSchema from "./services/ReadProjectSchema"

export function HandleIpcMessages() {
    ipcMain.handle("get:project:schema", async (event, projectPath) => {
        try {
            return await ReadProjectSchema.run(projectPath)
        } catch (error) {
            event.sender.send("error:default", error)
        }
    })

    ipcMain.handle("get:project:database", (event, projectPath) => {
        let databaseFilePath = path.join(projectPath, ".vemto", "data.json")
        let databaseData = FileSystem.readFileAsJsonIfExists(databaseFilePath)
        console.log('Database data', databaseData)
        return databaseData
    })
}
