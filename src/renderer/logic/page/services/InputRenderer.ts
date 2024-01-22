import Project from "@Common/models/Project"
import Input from "@Common/models/crud/Input"
import Main from "@Renderer/services/wrappers/Main"
import BladeFormatter from "@Renderer/codegen/formatters/BladeFormatter"
import TemplateCompiler from "@Renderer/codegen/templates/base/TemplateCompiler"
import TemplateHelpers from "@Renderer/codegen/sequential/services/helpers/TemplateHelpers"
export default class InputRenderer {
    project: Project

    setProject(project: Project) {
        this.project = project
    }

    async render(input: Input): Promise<string> {
        const templateCompiler = new TemplateCompiler(),
            templateContent = await Main.API.readTemplateFile(input.getTemplate())

        const helpers = new TemplateHelpers(this.project)

        templateCompiler
            .setContent(templateContent)
            .compilingInternally()
            .setData({
                input,
                helpers
            })
            .setVthemeKeys(this.project.getVthemeKeys())
            .setTemplateName(input.getTemplate())

        const compiledTemplate = await templateCompiler.compileWithImports()

        return BladeFormatter.setContent(
            compiledTemplate
        ).format()
    }

}