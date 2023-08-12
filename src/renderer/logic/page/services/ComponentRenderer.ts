import Main from "@Renderer/services/wrappers/Main"
import BladeFormatter from "@Renderer/codegen/formatters/BladeFormatter"
import Component from "@Common/models/page/components/interfaces/Component"
import TemplateCompiler from "@Renderer/codegen/templates/base/TemplateCompiler"

export default new class ComponentRenderer {

    async render(component: Component): Promise<string> {
        const templatePath = `page/components/${component.getName()}.vemtl`
        const templateContent = await Main.API.readTemplateFile(templatePath)

        console.log(templatePath, templateContent)

        TemplateCompiler
            .setContent(templateContent)
            .setData(component)

        const compiledTemplate = await TemplateCompiler.compileWithImports()

        return BladeFormatter.setContent(
            compiledTemplate
        ).format()
    }

}