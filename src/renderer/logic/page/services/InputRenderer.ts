import Input from "@Common/models/crud/Input"
import Main from "@Renderer/services/wrappers/Main"
import BladeFormatter from "@Renderer/codegen/formatters/BladeFormatter"
import TemplateCompiler from "@Renderer/codegen/templates/base/TemplateCompiler"

export default new class InputRenderer {

    async render(input: Input): Promise<string> {
        const templateContent = await Main.API.readTemplateFile(input.getTemplate())

        TemplateCompiler
            .setContent(templateContent)
            .compilingInternally()
            .setData({input})

        const compiledTemplate = await TemplateCompiler.compileWithImports()

        return BladeFormatter.setContent(
            compiledTemplate
        ).format()
    }

}