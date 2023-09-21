import Main from "./wrappers/Main"
import Project from "@Common/models/Project"
import debounce from "@Common/tools/debounce"
import RendererBridge from "./RendererBridge"
import RelaDB from "@tiago_silva_pereira/reladb"
import ModelRegistry from "@Common/ModelRegistry"
import { useProjectStore } from "@Renderer/stores/useProjectStore"

export default class HandleProjectDatabase {

    static start(initialDatabaseData: Object): RelaDB.Database {
        const database = new RelaDB.Database
            
        database.setDriver(RelaDB.RAMStorage)

        ModelRegistry.registerModels()

        RelaDB.Resolver.setDatabase(database)

        if(initialDatabaseData) {
            RelaDB.Resolver.db().driver.feedDatabaseData(initialDatabaseData)
        }

        // *** DONT MOVE THIS LINE ABOVE ***
        this.generateBasicProjectData()
        // *** DONT MOVE THIS LINE ABOVE ***

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

    static generateBasicProjectData() {
        const project = Project.find(1)

        if(project) {
            console.log("Generating basic project data")
            
            project.generateBasicData()
        }
    }

    static async populate(callback?: Function) {
        const projectStore = useProjectStore()

        if (projectStore.projectIsEmpty) {
            const latestProjectPath = window.localStorage.getItem("latest-project")

            if(!latestProjectPath) {
                return
            }

            const data = await Main.API.loadProjectDatabase(latestProjectPath)

            HandleProjectDatabase.start(data)

            projectStore.setProject(Project.find(1))
        }

        if(callback) callback()
    }

    static async close() {
        Main.API.closeProjectDatabase()
    }
}