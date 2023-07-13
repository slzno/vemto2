import Project from "@Common/models/Project"
import tailwindTheme from "./base/tailwind.vtheme"

export default class GenerateDefaultVthemeKeys {

    project: Project

    constructor(project: Project) {
        this.project = project
    }

    async handle() {
        Object.keys(tailwindTheme.keys).forEach((key) => {
            if(!this.project.hasVthemeKey(key)) {
                this.project.setVthemeKey(key, tailwindTheme.keys[key])
            }
        })

        this.project.save()
    }

}