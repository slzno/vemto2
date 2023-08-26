import Main from "@Renderer/services/wrappers/Main"
import BladeFormatter from "@Renderer/codegen/formatters/BladeFormatter"
import Component from "@Common/models/page/components/interfaces/Component"
import TemplateCompiler from "@Renderer/codegen/templates/base/TemplateCompiler"

export default class ComponentRenderer {

    async render(component: Component): Promise<string> {
        const templatePath = `page/components/${component.getName()}.vemtl`,
            templateCompiler = new TemplateCompiler(),    
            templateContent = await Main.API.readTemplateFile(templatePath)

        templateCompiler
            .setContent(templateContent)
            .compilingInternally()
            .setData(component)

        const compiledTemplate = await templateCompiler.compileWithImports()

        return BladeFormatter.setContent(
            compiledTemplate
        ).format()
    }

}