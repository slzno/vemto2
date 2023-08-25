import Input from "@Common/models/crud/Input"
import Main from "@Renderer/services/wrappers/Main"
import BladeFormatter from "@Renderer/codegen/formatters/BladeFormatter"
import TemplateCompiler from "@Renderer/codegen/templates/base/TemplateCompiler"
import { TemplateErrorLogger } from "@tiago_silva_pereira/vemto-template-engine"

export default class InputRenderer {

    private errorLogger: TemplateErrorLogger

    constructor(errorLogger: TemplateErrorLogger) {
        this.errorLogger = errorLogger
    }

    async render(input: Input): Promise<string> {
        const templateContent = await Main.API.readTemplateFile(input.getTemplate())

        TemplateCompiler
            .setContent(templateContent)
            .compilingInternally()
            .setData({input})
            .setErrorLogger(this.errorLogger)
            .setTemplateName(input.getTemplate())

        const compiledTemplate = await TemplateCompiler.compileWithImports()

        return BladeFormatter.setContent(
            compiledTemplate
        ).format()
    }

}