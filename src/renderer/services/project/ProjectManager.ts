import { v4 as uuid } from "uuid"
import HandleProjectDatabase from "../HandleProjectDatabase"

export default class ProjectManager {

    static closed = false
    static currentOpenProjectUuid = ""

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

    async connectFromPath(path: string) {
        let projectItem = this.findByPath(path)

        if(!projectItem) {
            projectItem = this.register(path)
        }

        await this.open(projectItem.id)
    }

    async open(id: string) {
        const projectItem = this.find(id)

        if (!projectItem) throw new Error("Project not found")

        const project = await HandleProjectDatabase.setup(projectItem.path)

        ProjectManager.setCurrentOpenProjectUuid(project.uuid)

        this.setLatestProjectPath(projectItem.path)

        this.setAsUpdated(id)

        ProjectManager.free()

        return projectItem
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

    register(path: string) {
        const projectItems = this.get()

        const id = uuid(),
            projectItem = { 
                id,
                path, 
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