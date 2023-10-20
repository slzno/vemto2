import { v4 as uuid } from "uuid"
import HandleProjectDatabase from "../HandleProjectDatabase"

export default class ProjectManager {

    static closed = false

    static isClosed() {
        return ProjectManager.closed
    }

    static free() {
        ProjectManager.closed = false
    }

    static close() {
        ProjectManager.closed = true
    }

    async connectFromPath(path: string) {
        let project = this.findByPath(path)

        if(!project) {
            project = this.register(path)
        }

        await this.open(project.id)
    }

    async open(id: string) {
        const project = this.find(id)

        if (!project) throw new Error("Project not found")

        await HandleProjectDatabase.setup(project.path)

        this.setLatestProjectPath(project.path)

        this.setAsUpdated(id)

        ProjectManager.free()

        return project
    }

    find(id: string) {
        const projects = this.get()

        return projects.find((p: any) => p.id === id)
    }

    findByPath(path: string) {
        const projects = this.get()

        return projects.find((p: any) => p.path === path)
    }

    setAsUpdated(id: string) {
        const projects = this.get()

        const index = projects.findIndex((p: any) => p.id === id)

        projects[index].updatedAt = new Date()

        window.localStorage.setItem("__projects", JSON.stringify(projects))
    }

    register(path: string) {
        const projects = this.get()

        const id = uuid(),
            project = { 
                id,
                path, 
                createdAt: new Date(), 
                updatedAt: new Date() 
            }

        projects.push(project)

        window.localStorage.setItem("__projects", JSON.stringify(projects))

        return project
    }

    get() {
        let projectsData = window.localStorage.getItem("__projects")

        if (!projectsData) return []

        const projects = JSON.parse(projectsData)

        return projects.sort((a: any, b: any) => {
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