import RelaDB from "@tiago_silva_pereira/reladb"

export default class HandleProjectDatabase {

    static start(initialDatabaseData: Object): RelaDB.Database {
        const database = new RelaDB.Database
            
        database.setDriver(RelaDB.RAMStorage)

        RelaDB.Resolver.setDatabase(database)

        if(initialDatabaseData) {
            RelaDB.Resolver.db().driver.feedDatabaseData(initialDatabaseData)
        }

        RelaDB.Resolver.db().onDataChanged(() => {
            const updatedData = RelaDB.Resolver.db().driver.getDatabaseData()
            
            window.api.databaseDataUpdated(updatedData)
        })

        return database
    }

}