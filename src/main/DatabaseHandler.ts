import path from "path"
import { ipcMain } from "electron"
import FileSystem from "./base/FileSystem"
import { handleError } from "./ErrorHandler"
import RelaDB from "@tiago_silva_pereira/reladb"
import Project from "../common/models/Project"
import ModelRegistry from "../common/ModelRegistry"
import ProjectPathResolver from "@Common/services/ProjectPathResolver"

export function HandleDatabase() {
    const database = new RelaDB.Database
    database.setDriver(RelaDB.RAMStorage)

    ModelRegistry.registerModels()

    RelaDB.Resolver.setDatabase(database)
    RelaDB.Resolver.db().driver.feedDatabaseData({})

    let needsToSave = false,
        isOpen = false

    ipcMain.handle("prepare:project:database", async (event, projectPath) => {
        return handleError(event, async () => {
            console.log('Preparing database...')

            isOpen = true
            ProjectPathResolver.setPath(projectPath)

            console.log('Project path set to:', projectPath)
        })
    })

    ipcMain.handle("get:project:database", (event, projectPath) => {
        return handleError(event, () => {
            let databaseFilePath = path.join(projectPath, ".vemto", "data.json")
            let databaseData = FileSystem.readFileAsJsonIfExists(databaseFilePath)

            console.log('Feeding database data from first read...')

            RelaDB.Resolver.db().driver.feedDatabaseData(databaseData)
            
            return databaseData
        })
    })

    ipcMain.handle("close:project:database", (event) => {
        return handleError(event, () => {
            console.log('Closing database...')

            isOpen = false
            RelaDB.Resolver.db().driver.feedDatabaseData({})

            return true
        })
    })

    ipcMain.handle("database:data:updated", (event, data) => {
        if (!isOpen) {
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
        if (!isOpen) return
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
