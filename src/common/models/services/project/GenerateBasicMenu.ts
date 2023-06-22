import Nav from "@Common/models/Nav"
import Project from "@Common/models/Project"

export default class GenerateBasicMenu {

    project: Project

    constructor(project: Project) {
        this.project = project
    }

    handle() {
        if(this.project.navs.length) return

        Nav.create({
            name: "Home",
            tag: "home",
            projectId: this.project.id,
        })

        Nav.create({
            name: "Apps",
            tag: "apps",
            projectId: this.project.id,
        })
    }

}