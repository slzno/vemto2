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

        this.refreshProject()
    }

    /**
     * We need to refresh the project data because each time we create a new nav item
     * the project data updated from different instances of the project model
     */
    refreshProject() {
        this.project.refresh()
    }

}