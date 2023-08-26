import Main from "@Renderer/services/wrappers/Main"
import PhpFormatter from "@Renderer/codegen/formatters/PhpFormatter"
import TemplateCompiler from "@Renderer/codegen/templates/base/TemplateCompiler"

export default class RenderableFile {
    name: string
    relativePath: string
    template: string

    async render() {
        const templateCompiler = new TemplateCompiler(),
            templateContent = await Main.API.readTemplateFile(this.template)

        templateCompiler
            .setContent(templateContent)
            .setData({})

        const compiledTemplate = await templateCompiler.compileWithImports()

        const renderedContent = PhpFormatter.setContent(
            compiledTemplate
        ).format()

        return Main.API.addFileToGenerationQueue(
            this.relativePath + this.name,
            renderedContent
        )
    }
}