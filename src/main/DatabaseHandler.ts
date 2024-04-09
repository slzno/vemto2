import path from "path"
import { ipcMain } from "electron"
import FileSystem from "./base/FileSystem"
import { handleError } from "./ErrorHandler"
import RelaDB from "@tiago_silva_pereira/reladb"
import Project from "../common/models/Project"
import ModelRegistry from "../common/ModelRegistry"
import ProjectPathResolver from "@Common/services/ProjectPathResolver"
import ProjectHandler from "./ProjectHandler"

export function HandleDatabase() {
    const database = new RelaDB.Database
    database.setDriver(RelaDB.RAMStorage)

    ModelRegistry.registerModels()

    RelaDB.Resolver.setDatabase(database)
    RelaDB.Resolver.db().driver.feedDatabaseData({})

    let needsToSave = false

    ipcMain.handle("get:project:database", (event, projectPath) => {
        return handleError(event, () => {
            let databaseFilePath = path.join(projectPath, ".vemto", "data.json")
            let databaseData = FileSystem.readFileAsJsonIfExists(databaseFilePath)

            if (!databaseData) {
                console.log('Database data not found, creating new one...')
                databaseData = RelaDB.Resolver.db().driver.storeBaseData()
            }

            console.log('Feeding database data from first read...')

            RelaDB.Resolver.db().driver.feedDatabaseData(databaseData)
            
            return databaseData
        })
    })

    ipcMain.handle("close:project:database", (event) => {
        return handleError(event, () => {
            console.log('Closing database...')

            ProjectHandler.close()

            RelaDB.Resolver.db().driver.feedDatabaseData({})

            ProjectPathResolver.clearPath()

            return true
        })
    })

    ipcMain.handle("database:data:updated", (event, data) => {
        if (!ProjectHandler.isOpen()) {
            console.log('Database is not open')
            return
        }

        let oldData = RelaDB.Resolver.db().driver.getDatabaseData()

        if (JSON.stringify(oldData) !== JSON.stringify(data)) {
            RelaDB.Resolver.db().driver.feedDatabaseData(data)
            needsToSave = true
        }
    })

    setInterval(() => {
        if (!ProjectHandler.isOpen()) return
        if (!needsToSave) return

        console.log('Saving database data...')

        const project = Project.findOrFail(1)

        if(!project) return
        if(!project.getPath()) return

        let databaseFilePath = path.join(project.getPath(), ".vemto", "data.json")
        
        FileSystem.writeJsonFile(
            databaseFilePath, 
            RelaDB.Resolver.db().driver.getDatabaseData()
        )

        needsToSave = false
    }, 1000)
}
