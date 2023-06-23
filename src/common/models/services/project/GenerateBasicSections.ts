import Project from "@Common/models/Project"
import AppSection from "@Common/models/AppSection"

export default class GenerateBasicSections {

    project: Project

    constructor(project: Project) {
        this.project = project
    }

    async handle() {
        if(this.project.appSections.length) return

        AppSection.create({
            name: "Admin",
            routePrefix: "admin",
            projectId: this.project.id,
            requiresAuth: true,
        })

        AppSection.create({
            name: "Site",
            routePrefix: "",
            projectId: this.project.id,
            requiresAuth: false,
        })
    }

}