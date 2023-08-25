import Main from "@Renderer/services/wrappers/Main"
import BladeFormatter from "@Renderer/codegen/formatters/BladeFormatter"
import Component from "@Common/models/page/components/interfaces/Component"
import TemplateCompiler from "@Renderer/codegen/templates/base/TemplateCompiler"
import { TemplateErrorLogger } from "@tiago_silva_pereira/vemto-template-engine"

export default class ComponentRenderer {

    private errorLogger: TemplateErrorLogger

    constructor(errorLogger: TemplateErrorLogger) {
        this.errorLogger = errorLogger
    }

    async render(component: Component): Promise<string> {
        const templatePath = `page/components/${component.getName()}.vemtl`
        const templateContent = await Main.API.readTemplateFile(templatePath)

        TemplateCompiler
            .setContent(templateContent)
            .compilingInternally()
            .setData(component)
            .setErrorLogger(this.errorLogger)

        const compiledTemplate = await TemplateCompiler.compileWithImports()

        return BladeFormatter.setContent(
            compiledTemplate
        ).format()
    }

}