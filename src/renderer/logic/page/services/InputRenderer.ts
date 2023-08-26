import Input from "@Common/models/crud/Input"
import Main from "@Renderer/services/wrappers/Main"
import BladeFormatter from "@Renderer/codegen/formatters/BladeFormatter"
import TemplateCompiler from "@Renderer/codegen/templates/base/TemplateCompiler"
export default class InputRenderer {

    async render(input: Input): Promise<string> {
        try {
            const templateCompiler = new TemplateCompiler(),
                templateContent = await Main.API.readTemplateFile(input.getTemplate())

            templateCompiler
                .setContent(templateContent)
                .compilingInternally()
                .setData({input})
                .setTemplateName(input.getTemplate())
    
            const compiledTemplate = await templateCompiler.compileWithImports()
    
            return BladeFormatter.setContent(
                compiledTemplate
            ).format()
        } catch (error: any) {
            throw error
            
            // return `<!-- Error rendering input ${input.name}: ${error.message} -->`
        }
    }

}