import Main from "./wrappers/Main"
import Project from "@Common/models/Project"
import debounce from "@Common/tools/debounce"
import RendererBridge from "./RendererBridge"
import RelaDB from "@tiago_silva_pereira/reladb"
import ModelRegistry from "@Common/ModelRegistry"
import { useProjectStore } from "@Renderer/stores/useProjectStore"
import ProjectPathResolver from "@Common/services/ProjectPathResolver"
import ProjectManager from "./project/ProjectManager"

export default class HandleProjectDatabase {

    static async setup(projectPath: string) {
        const projectStore = useProjectStore()

        await Main.API.prepareProject(projectPath)
        ProjectPathResolver.setPath(projectPath)

        const data = await Main.API.loadProjectDatabase(projectPath)

        HandleProjectDatabase.start(data)

        const project = Project.findOrCreate()

        projectStore.setProject(project)

        return project
    }

    static start(initialDatabaseData: Object): RelaDB.Database {
        const database = new RelaDB.Database
            
        database.setDriver(RelaDB.RAMStorage)

        ModelRegistry.registerModels()

        RelaDB.Resolver.setDatabase(database)

        if(initialDatabaseData) {
            RelaDB.Resolver.db().driver.feedDatabaseData(initialDatabaseData)
        }

        RelaDB.Resolver.db().onDataChanged(() => {
            updateDataDebounced()
        })

        const updateDataDebounced = debounce(() => {
            const updatedData = RelaDB.Resolver.db().driver.getDatabaseData()

            Main.API.databaseDataUpdated(updatedData)

            RendererBridge.dataUpdated()

            console.log("Database data updated")
        }, 300)

        return database
    }

    static async populate(callback?: Function) {
        const projectStore = useProjectStore(),
            projectManager = new ProjectManager()

        if (projectStore.projectIsEmpty) {
            const latestProjectPath = projectManager.getLatestProjectPath()

            if(!latestProjectPath) return

            await projectManager.connectToLatest()
        }
        
        projectStore.refreshProject()
        
        if(callback) callback()
    }

    static async close() {
        RelaDB.Resolver.db().driver.feedDatabaseData({})
        Main.API.closeProjectDatabase()
    }
}