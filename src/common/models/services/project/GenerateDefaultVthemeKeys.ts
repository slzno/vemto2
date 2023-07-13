import Project from "@Common/models/Project"
import tailwindKeys from "./base/vthemeDefaultKeys.tailwind"

export default class GenerateDefaultVthemeKeys {

    project: Project

    constructor(project: Project) {
        this.project = project
    }

    async handle() {
        Object.keys(tailwindKeys).forEach((key) => {
            if(!this.project.hasVthemeKey(key)) {
                this.project.setVthemeKey(key, tailwindKeys[key])
            }
        })

        this.project.save()
    }

}