import Project from "@Common/models/Project"
import AppSection from "@Common/models/AppSection"

export default class GenerateBasicSections {

    project: Project

    constructor(project: Project) {
        this.project = project
    }

    async handle() {
        if(!AppSection.findSectionByName('Dashboard')) {
            AppSection.create({
                name: "Dashboard",
                routePrefix: "dashboard",
                routeBasePath: "dashboard",
                projectId: this.project.id,
                requiresAuth: true,
            })
        }

        if(!AppSection.findSectionByName('Site')) {
            AppSection.create({
                name: "Site",
                routePrefix: "",
                routeBasePath: "",
                projectId: this.project.id,
                requiresAuth: false,
            })
        }
    }

}