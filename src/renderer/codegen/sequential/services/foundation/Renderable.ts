import Project from "@Common/models/Project"
import Main from "@Renderer/services/wrappers/Main"
import PhpFormatter from "@Renderer/codegen/formatters/PhpFormatter"
import TemplateCompiler from "@Renderer/codegen/templates/base/TemplateCompiler"

export default abstract class Renderable {
    project: Project

    constructor() {
        const project = Project.find(1)

        this.setProject(project)
    }

    abstract getTemplateFile(): string
    abstract getPath(): string
    abstract getFilename(): string
    abstract getFormatter(): string
    abstract getData(): any

    async render() {
        console.log('Rendering template...')
    }

    async compile() {
        if(!this.project) {
            throw new Error(`Renderable for ${this.getTemplateFile()} doesn't has the project associated. Please set it with setProject() before calling render().`)
        }

        const templateContent = await Main.API.readTemplateFile("CreationMigration.vemtl")

        TemplateCompiler
            .setContent(templateContent)
            .setData(this.getData())

        const compiledTemplate = await TemplateCompiler.compileWithImports()

        return this.formatCompiledTemplate(compiledTemplate)
    }

    setProject(project: Project) {
        this.project = project

        return this
    }

    formatCompiledTemplate(compiledTemplate: string) {
        if(this.getFormatter() === 'php') {
            return PhpFormatter.setContent(
                compiledTemplate
            ).format()
        }

        return compiledTemplate
    }
}