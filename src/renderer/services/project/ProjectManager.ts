import { v4 as uuid } from "uuid"
import Project, { ProjectSettings } from "@Common/models/Project"
import HandleProjectDatabase from "../HandleProjectDatabase"
import ProjectConnector from "./ProjectConnector"
import SchemaBuilder from "../schema/SchemaBuilder"
import Main from "../wrappers/Main"
import PathUtil from "@Common/util/PathUtil"

export default class ProjectManager {

    static closed = false
    static currentOpenProjectUuid = ""

    projectSettings: ProjectSettings

    static isClosed() {
        return ProjectManager.closed
    }

    static free() {
        ProjectManager.closed = false
    }

    static async close() {
        ProjectManager.closed = true

        ProjectManager.setCurrentOpenProjectUuid("")

        await HandleProjectDatabase.close()
    }

    async connectToLatest() {
        const latestProjectPath = this.getLatestProjectPath()

        if (latestProjectPath) {
            await this.connectFromPath(latestProjectPath)
        }
    }

    async projectHasComposerVendor(projectPath: string) {
        const path = PathUtil.join(projectPath, "vendor")

        return await Main.API.folderExists(path)
    }

    async connectFromPath(path: string) {
        try {
            const isConnectingToNonVemtoProject = await this.isConnectingToNonVemtoProject(path)
            
            if(isConnectingToNonVemtoProject) {
                await SchemaBuilder.checkForErrors(path)
            }

            let projectItem = this.findByPath(path)
    
            if(!projectItem) {
                projectItem = this.register(path)
            }
    
            await this.open(projectItem.id)
        } catch (error) {
            console.log("Error ocurred")
            throw error
        }
    }

    async isConnectingToNonVemtoProject(projectPath: string) {
        return !await this.projectHasVemtoFolder(projectPath)
    }

    async projectHasVemtoFolder(projectPath: string) {
        const path = PathUtil.join(projectPath, ".vemto")

        console.log("Checking for .vemto folder at", path)

        return await Main.API.folderExists(path)
    }

    async open(id: string) {
        const projectItem = this.find(id)

        if (!projectItem) throw new Error("Project not found")

        const project: Project = await HandleProjectDatabase.setup(projectItem.path)
        
        ProjectManager.setCurrentOpenProjectUuid(project.uuid)
        
        await this.connectProject(project)

        await this.publishAssets()

        ProjectManager.free()

        this.setLatestProjectPath(projectItem.path)

        const laravelVersion = this.projectSettings 
            ? this.projectSettings.laravelVersion 
            : project.settings.laravelVersion

        const schemaReaderMode = this.projectSettings
            ? this.projectSettings.schemaReaderMode
            : project.settings.schemaReaderMode

        this.update(projectItem.id, {
            path: PathUtil.normalize(projectItem.path),
            laravelVersion,
            schemaReaderMode,
        })

        await SchemaBuilder.checkSchemaChangesForProject(project)

        return projectItem
    }

    async connectProject(project: Project) {
        const projectConnector = new ProjectConnector(project)

        await projectConnector.connect(
            this.projectSettings
        )
    }

    async publishAssets() {
        await Main.API.publishTemplates()
    }

    setSettings(settings: ProjectSettings) {
        this.projectSettings = settings
    }

    static getCurrentOpenProjectUuid() {
        return ProjectManager.currentOpenProjectUuid
    }

    static setCurrentOpenProjectUuid(uuid: string) {
        ProjectManager.currentOpenProjectUuid = uuid
    }

    find(id: string) {
        const projectItems = this.get()

        return projectItems.find((p: any) => p.id === id)
    }

    findByPath(path: string) {
        const projectItems = this.get()

        return projectItems.find((p: any) => p.path === path)
    }

    setAsUpdated(id: string) {
        const projectItems = this.get()

        const index = projectItems.findIndex((p: any) => p.id === id)

        projectItems[index].updatedAt = new Date()

        window.localStorage.setItem("__projects", JSON.stringify(projectItems))
    }

    update(id: string, data: any) {
        const projectItems = this.get()

        const index = projectItems.findIndex((p: any) => p.id === id)

        projectItems[index] = {
            ...projectItems[index],
            ...data
        }

        projectItems[index].updatedAt = new Date()

        window.localStorage.setItem("__projects", JSON.stringify(projectItems))
    }

    register(path: string) {
        const projectItems = this.get()

        const id = uuid(),
            projectItem = { 
                id,
                path, 
                type: "Folder",
                laravelVersion: null,
                schemaReaderMode: "db",
                createdAt: new Date(), 
                updatedAt: new Date() 
            }

        projectItems.push(projectItem)

        window.localStorage.setItem("__projects", JSON.stringify(projectItems))

        return projectItem
    }

    disconnect(id: string) {
        const projectItems = this.get()

        const index = projectItems.findIndex((p: any) => p.id === id)

        projectItems.splice(index, 1)

        window.localStorage.setItem("__projects", JSON.stringify(projectItems))
    }

    get() {
        let projectItemsData = window.localStorage.getItem("__projects")

        if (!projectItemsData) return []

        const projectItems = JSON.parse(projectItemsData)

        return projectItems.sort((a: any, b: any) => {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        })
    }

    getLatestProjectPath() {
        return window.localStorage.getItem("latest-project")
    }

    setLatestProjectPath(path: string) {
        window.localStorage.setItem("latest-project", path)
    }

}