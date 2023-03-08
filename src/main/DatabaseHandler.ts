import path from "path"
import { ipcMain } from "electron"
import FileSystem from "./base/FileSystem"
import { handleError } from "./ErrorHandler"
import RelaDB from "@tiago_silva_pereira/reladb"
import Project from "../common/models/Project"

export function HandleDatabase() {
    const database = new RelaDB.Database
    database.setDriver(RelaDB.RAMStorage)

    RelaDB.Resolver.setDatabase(database)
    RelaDB.Resolver.db().driver.feedDatabaseData({})

    let needsToSave = false

    ipcMain.handle("get:project:database", (event, projectPath) => {
        return handleError(event, () => {
            let databaseFilePath = path.join(projectPath, ".vemto", "data.json")
            let databaseData = FileSystem.readFileAsJsonIfExists(databaseFilePath)

            console.log('Feeding database data from first read...')

            RelaDB.Resolver.db().driver.feedDatabaseData(databaseData)
            
            return databaseData
        })
    })

    ipcMain.handle("database:data:updated", (event, data) => {
        let oldData = RelaDB.Resolver.db().driver.getDatabaseData()

        if (JSON.stringify(oldData) !== JSON.stringify(data)) {
            RelaDB.Resolver.db().driver.feedDatabaseData(data)
            needsToSave = true
        }
    })

    setInterval(() => {
        if (!needsToSave) return

        console.log('Saving database data...')

        const project = Project.findOrFail(1)

        let databaseFilePath = path.join(project.getPath(), ".vemto", "data.json")
        
        FileSystem.writeJsonFile(
            databaseFilePath, 
            RelaDB.Resolver.db().driver.getDatabaseData()
        )

        needsToSave = false
    }, 1000)
}
