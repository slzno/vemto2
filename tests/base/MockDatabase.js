import Project from "@Common/models/Project"
import RelaDB from "@tiago_silva_pereira/reladb"

export default class MockDatabase {

    static start() {
        const database = new RelaDB.Database
            
        database.setDriver(RelaDB.RAMStorage)

        RelaDB.Resolver.setDatabase(database)
        
        RelaDB.Resolver.db().driver.feedDatabaseData(
            RelaDB.Resolver.db().driver.storeBaseData()
        )

        const project = new Project
        project.name = "Test Project"
        project.save()

        return database
    }

}