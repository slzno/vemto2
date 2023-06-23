import Project from "@Common/models/Project"
import AppSection from "@Common/models/AppSection"

export default class GenerateBasicSections {

    project: Project

    constructor(project: Project) {
        this.project = project
    }

    async handle() {
        if(!AppSection.findDefaultAdminSection()) {
            AppSection.create({
                name: "Admin",
                routePrefix: "admin",
                routeBasePath: "admin",
                projectId: this.project.id,
                requiresAuth: true,
            })
        }

        if(!AppSection.findDefaultSiteSection()) {
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