import Main from "@Renderer/services/wrappers/Main"
import PhpFormatter from "@Renderer/codegen/formatters/PhpFormatter"
import TemplateCompiler from "@Renderer/codegen/templates/base/TemplateCompiler"

export default class RenderableFile {
    name: string
    relativePath: string
    template: string

    async render() {
        const templateContent = await Main.API.readTemplateFile(this.template)

        TemplateCompiler
            .setContent(templateContent)
            .setData({})

        const compiledTemplate = await TemplateCompiler.compileWithImports()

        const renderedContent = PhpFormatter.setContent(
            compiledTemplate
        ).format()

        return Main.API.addFileToGenerationQueue(
            this.relativePath + this.name,
            renderedContent
        )
    }
}