import Project from "@Common/models/Project"
import ProjectLanguages from "./ProjectLanguages"

export default class GenerateLanguagesData {

    project: Project

    constructor(project: Project) {
        this.project = project
    }

    async handle() {
        this.project.languages = await ProjectLanguages.getLanguages()
        this.project.defaultLanguage = await ProjectLanguages.getDefaultLanguage()

        this.project.save()
    }

}