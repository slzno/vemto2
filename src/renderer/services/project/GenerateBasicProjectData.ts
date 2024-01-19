import Project from "@Common/models/Project"
import GenerateBasicMenu from "./GenerateBasicMenu"
import GenerateBasicSections from "./GenerateBasicSections"
import GenerateDefaultVthemeKeys from "./GenerateDefaultVthemeKeys"
import GenerateLanguagesData from "./GenerateLanguagesData"

export default class GenerateBasicProjectData {

    project: Project

    constructor(project: Project) {
        this.project = project
    }

    async handle() {
        await new GenerateBasicMenu(this.project).handle()
        await new GenerateBasicSections(this.project).handle()
        await new GenerateDefaultVthemeKeys(this.project).handle()
        await new GenerateLanguagesData(this.project).handle()
    }

}