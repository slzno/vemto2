import Project from "@Common/models/Project"
import Main from "@Renderer/services/wrappers/Main"
import PhpFormatter from "@Renderer/codegen/formatters/PhpFormatter"
import TemplateCompiler from "@Renderer/codegen/templates/base/TemplateCompiler"
import { RenderableFileFormatter, RenderableFileType } from "@Common/models/RenderableFile"

export default abstract class Renderable {
    project: Project
    hooksEnabled: boolean = true

    constructor() {
        const project = Project.find(1)

        this.setProject(project)
    }

    abstract getType(): RenderableFileType
    abstract getTemplateFile(): string
    abstract getPath(): string
    abstract getFilename(): string
    abstract getFormatter(): RenderableFileFormatter
    abstract getData(): any
    abstract canRender(): boolean
    
    protected hooks?(): any
    protected beforeRender?(): void
    protected afterRender?(renderedContent: string): void

    setProject(project: Project) {
        this.project = project

        return this
    }

    enableHooks() {
        this.hooksEnabled = true

        return this
    }

    disableHooks() {
        this.hooksEnabled = false

        return this
    }

    async render() {
        if(!this.canRender()) {
            console.log(`Skipping ${this.getTemplateFile()} for file ${this.getFullFilePath()}...`)
            return
        }

        if(this.beforeRender) this.beforeRender()

        console.log(`Rendering ${this.getTemplateFile()} as ${this.getFullFilePath()}...`)

        const file = this.project.registerRenderableFile(
            this.getPath(), 
            this.getFilename(),
            this.getTemplateFile(), 
            this.getType(),
        )
        
        try {
            const compiledTemplate = await this.compile()
            
            file.setContent(compiledTemplate)
            
            if(this.afterRender) this.afterRender(compiledTemplate)
        } catch (error: any) {
            file.setError(error.message)

            if(error.hasTemplateError) {
                file.hasTemplateError = true
                file.templateErrorLine = error.templateLine
                file.save()
            }
        }
    }

    getFullFilePath() {
        return `${this.getPath()}/${this.getFilename()}`
    }

    getFilenameWithoutExtension() {
        return this.getFilename().replace(/\.[^/.]+$/, "")
    }

    getFullData() {
        return {
            ...this.getData(),
            project: this.project,
            filenameWithoutExtension: this.getFilenameWithoutExtension(),
        }
    }

    async compile() {
        if(!this.project) {
            throw new Error(`Renderable for ${this.getTemplateFile()} doesn't has the project associated. Please set it with setProject() before calling render().`)
        }

        const templateFile = this.getTemplateFile(), 
            templateContent = await Main.API.readTemplateFile(templateFile)

        TemplateCompiler
            .setContent(templateContent)
            .setData(this.getFullData())

        TemplateCompiler.setHooksEnabled(this.hooksEnabled)
        if(this.hooks) TemplateCompiler.setHooks(this.hooks())

        const compiledTemplate = await TemplateCompiler.compileWithImports()

        return this.formatCompiledTemplate(compiledTemplate)
    }

    async formatCompiledTemplate(compiledTemplate: string) {
        if(this.getFormatter() === RenderableFileFormatter.PHP) {
            return PhpFormatter.setContent(
                compiledTemplate
            ).format()
        }

        return compiledTemplate
    }
}