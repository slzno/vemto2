import Main from "./wrappers/Main"
import debounce from "@Common/tools/debounce"
import RendererBridge from "./RendererBridge"
import RelaDB from "@tiago_silva_pereira/reladb"
import { useProjectStore } from "@Renderer/stores/useProjectStore"

export default class HandleProjectDatabase {

    static start(initialDatabaseData: Object): RelaDB.Database {
        const database = new RelaDB.Database
            
        database.setDriver(RelaDB.RAMStorage)

        RelaDB.Resolver.setDatabase(database)

        if(initialDatabaseData) {
            RelaDB.Resolver.db().driver.feedDatabaseData(initialDatabaseData)
        }

        RelaDB.Resolver.db().onDataChanged(() => {
            updateDataDebounced()
        })

        const updateDataDebounced = debounce(() => {
            const updatedData = RelaDB.Resolver.db().driver.getDatabaseData(),
                projectStore = useProjectStore()

            Main.API.databaseDataUpdated(updatedData)

            RendererBridge.dataUpdated()

            projectStore.reloadProject()

            console.log("Database data updated")
        }, 300)

        return database
    }

}