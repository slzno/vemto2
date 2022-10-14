import { ipcMain } from "electron"
import RelaDB from "@tiago_silva_pereira/reladb"

export function HandleDatabase() {
    const database = new RelaDB.Database
    database.setDriver(RelaDB.RAMStorage)

    RelaDB.Resolver.setDatabase(database)
    RelaDB.Resolver.db().driver.feedDatabaseData({})
    
    RelaDB.Resolver.db().onDataChanged(() => {
        const updatedData = RelaDB.Resolver.db().driver.getDatabaseData()
        console.log(updatedData)
    })

    console.log('Starting database')

    ipcMain.handle("database:data:updated", (event, data) => {
        RelaDB.Resolver.db().driver.feedDatabaseData(data)

        console.log('Database data changed', data)
    })
}
