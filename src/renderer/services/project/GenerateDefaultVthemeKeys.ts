import Project, { ProjectCssFramework } from "@Common/models/Project"
import bulmaTheme from "@Renderer/services/project/base/bulma.vtheme"
import bootstrapTheme from "@Renderer/services/project/base/bootstrap.vtheme"
import tailwindTheme from "@Renderer/services/project/base/tailwind.vtheme"
import foundationTheme from "@Renderer/services/project/base/foundation.vtheme"

export default class GenerateDefaultVthemeKeys {

    project: Project

    constructor(project: Project) {
        this.project = project
    }

    async handle(framework: ProjectCssFramework = ProjectCssFramework.TAILWIND) {
        const themeData = this.getCorrectThemeData(framework)

        Object.keys(themeData.keys).forEach((key) => {
            if(!this.project.hasVthemeKey(key)) {
                this.project.setVthemeKey(key, themeData.keys[key])
            }
        })

        this.project.setVthemeCdn(themeData.cdn)
        this.project.save()
    }

    getCorrectThemeData(framework: ProjectCssFramework) {
        switch(framework) {
            case ProjectCssFramework.BULMA:
                return bulmaTheme
            case ProjectCssFramework.BOOTSTRAP:
                return bootstrapTheme
            case ProjectCssFramework.TAILWIND:
                return tailwindTheme
            case ProjectCssFramework.FOUNDATION:
                return foundationTheme
            default:
                return this.getThemeDataWithoutValues()
        }
    }

    getThemeDataWithoutValues() {
        const baseThemeData = tailwindTheme

        baseThemeData.cdn = ""

        Object.keys(baseThemeData.keys).forEach((key) => {
            baseThemeData.keys[key] = ""
        })

        return baseThemeData
    }

    async reset(framework: ProjectCssFramework = ProjectCssFramework.TAILWIND) {
        this.project.vthemeKeys = {}

        return this.handle(framework)
    }

}