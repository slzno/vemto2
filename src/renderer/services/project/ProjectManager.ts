import { v4 as uuid } from "uuid"
import HandleProjectDatabase from "../HandleProjectDatabase"

export default class ProjectManager {

    async connectFromPath(path: string) {
        const project = this.findByPath(path)

        if(!project) {
            project = this.registerProject(path)
        }

        await this.open(project.id)
    }

    async open(id: string) {
        const project = this.find(id)

        if (!project) throw new Error("Project not found")

        await HandleProjectDatabase.setup(project.getPath())

        this.setLatestProjectPath(project.getPath())
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

    register(name: string, path: string) {
        const projects = this.get()

        const id = uuid()

        projects.push({ 
            id,
            name, 
            path, 
            createdAt: new Date(), 
            updatedAt: new Date() 
        })

        window.localStorage.setItem("__projects", JSON.stringify(projects))
    }

    get() {
        const projects = window.localStorage.getItem("__projects")

        if (!projects) return []

        return JSON.parse(projects)
    }

    getLatestProjectPath() {
        return window.localStorage.getItem("latest-project")
    }

    setLatestProjectPath(path: string) {
        window.localStorage.setItem("latest-project", path)
    }

}