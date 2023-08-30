import Project from "@Common/models/Project"
import Input from "@Common/models/crud/Input"
import Main from "@Renderer/services/wrappers/Main"
import BladeFormatter from "@Renderer/codegen/formatters/BladeFormatter"
import TemplateCompiler from "@Renderer/codegen/templates/base/TemplateCompiler"
export default class InputRenderer {
    project: Project

    setProject(project: Project) {
        this.project = project
    }

    async render(input: Input): Promise<string> {
        const templateCompiler = new TemplateCompiler(),
            templateContent = await Main.API.readTemplateFile(input.getTemplate())

        templateCompiler
            .setContent(templateContent)
            .compilingInternally()
            .setData({input})
            .setVthemeKeys(this.project.getVthemeKeys())
            .setTemplateName(input.getTemplate())

        const compiledTemplate = await templateCompiler.compileWithImports()

        return BladeFormatter.setContent(
            compiledTemplate
        ).format()
    }

}