import { ipcMain } from "electron"
import RelaDB from "@tiago_silva_pereira/reladb"
import Project from "../common/models/Project"

export function HandleDatabase() {
    const database = new RelaDB.Database
    database.setDriver(RelaDB.RAMStorage)

    RelaDB.Resolver.setDatabase(database)
    RelaDB.Resolver.db().driver.feedDatabaseData({})

    ipcMain.handle("database:data:updated", (event, data) => {
        RelaDB.Resolver.db().driver.feedDatabaseData(data)

        console.log('project', Project.find(1))
    })
}
