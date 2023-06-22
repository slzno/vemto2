import Project from "@Common/models/Project"
import GenerateBasicMenu from "./GenerateBasicMenu"

export default class GenerateBasicProjectData {

    project: Project

    constructor(project: Project) {
        this.project = project
    }

    handle() {
        (new GenerateBasicMenu(this.project)).handle()
    }

}