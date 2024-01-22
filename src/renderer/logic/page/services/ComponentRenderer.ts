import Project from "@Common/models/Project"
import Main from "@Renderer/services/wrappers/Main"
import BladeFormatter from "@Renderer/codegen/formatters/BladeFormatter"
import Component from "@Common/models/page/components/interfaces/Component"
import TemplateCompiler from "@Renderer/codegen/templates/base/TemplateCompiler"
import TemplateHelpers from "@Renderer/codegen/sequential/services/helpers/TemplateHelpers"

export default class ComponentRenderer {

    project: Project

    setProject(project: Project) {
        this.project = project
    }

    async render(component: Component): Promise<string> {
        const templatePath = `page/components/${component.getName()}.vemtl`,
            templateCompiler = new TemplateCompiler(),    
            templateContent = await Main.API.readTemplateFile(templatePath)

        const helpers = new TemplateHelpers(this.project)

        templateCompiler
            .setContent(templateContent)
            .compilingInternally()
            .setData({
                component,
                helpers
            })

        const compiledTemplate = await templateCompiler.compileWithImports()

        return BladeFormatter.setContent(
            compiledTemplate
        ).format()
    }

}