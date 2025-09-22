import Project from "@Common/models/Project"
import RelaDB from "@tiago_silva_pereira/reladb"
import ModelRegistry from "@Common/ModelRegistry"
import TestHelper from "./TestHelper"

export default class MockDatabase {

    static start() {
        const database = new RelaDB.Database
            
        database.setDriver(RelaDB.RAMStorage)

        ModelRegistry.registerModels()

        RelaDB.Resolver.setDatabase(database)
        
        RelaDB.Resolver.db().driver.feedDatabaseData(
            RelaDB.Resolver.db().driver.storeBaseData()
        )

        let project = Project.find(1)
        
        if(project) {
            console.log('Deleting existing project')
            project.delete()
        }

        TestHelper.createProject()

        return database
    }

}