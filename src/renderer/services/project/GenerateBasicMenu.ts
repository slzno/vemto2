import Nav from "@Common/models/Nav"
import Project from "@Common/models/Project"

export default class GenerateBasicMenu {

    project: Project

    constructor(project: Project) {
        this.project = project
    }

    async handle() {
        const homeNav = Nav.createFromProject('Home', this.project.id)

        homeNav.tag = 'home'
        homeNav.save()

        const appsNav = Nav.createFromProject('Apps', this.project.id)

        appsNav.tag = 'apps'
        appsNav.save()
    }

}