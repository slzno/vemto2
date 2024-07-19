import Project from "@Common/models/Project"
import AppSection from "@Common/models/AppSection"

export default class GenerateBasicSections {

    project: Project

    constructor(project: Project) {
        this.project = project
    }

    async handle() {
        AppSection.create({
            name: "Dashboard",
            routePrefix: "dashboard",
            routeBasePath: "dashboard",
            projectId: this.project.id,
            requiresAuth: true,
        })

        AppSection.create({
            name: "API",
            routePrefix: "api",
            routeBasePath: "api",
            projectId: this.project.id,
            requiresAuth: true,
        })

        AppSection.create({
            name: "Site",
            routePrefix: "",
            routeBasePath: "",
            projectId: this.project.id,
            requiresAuth: false,
        })

        AppSection.create({
            name: "Filament Panel",
            routePrefix: "panel",
            routeBasePath: "panel",
            projectId: this.project.id,
            requiresAuth: false,
        })
    }

}