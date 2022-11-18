import Project from "@Common/models/Project"
import RelaDB from "@tiago_silva_pereira/reladb"

export default class MockDatabase {

    static start(initialDatabaseData) {
        const database = new RelaDB.Database
            
        database.setDriver(RelaDB.RAMStorage)

        RelaDB.Resolver.setDatabase(database)

        if(initialDatabaseData) {
            RelaDB.Resolver.db().driver.feedDatabaseData(initialDatabaseData)
        }

        const project = new Project
        project.name = "Test Project"
        project.save()

        return database
    }

}