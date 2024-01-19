import Project from "@Common/models/Project"
import Main from "@Renderer/services/wrappers/Main"
import PhpFormatter from "@Renderer/codegen/formatters/PhpFormatter"
import TemplateCompiler from "@Renderer/codegen/templates/base/TemplateCompiler"
import { RenderableFileFormatter, RenderableFileType } from "@Common/models/RenderableFile"
import BladeFormatter from "@Renderer/codegen/formatters/BladeFormatter"
import PathUtil from "@Common/util/PathUtil"

export default abstract class Renderable {
    project: Project
    hooksEnabled: boolean = true
    logEnabled: boolean = false

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

        if(this.logEnabled) {
            console.log(`Rendering ${this.getTemplateFile()} as ${this.getFullFilePath()}...`)
        }

        const file = this.project.registerRenderableFile(
            this.getPath(), 
            this.getFilename(),
            this.getTemplateFile(), 
            this.getType(),
        )

        if(file.wasIgnored()) {
            if(this.logEnabled) {
                console.log(`Ignoring ${this.getTemplateFile()} for file ${this.getFullFilePath()}...`)
            }
            
            return
        }
        
        try {
            const compiledTemplate = await this.compile()
            
            file.setContent(compiledTemplate)
            
            if(this.afterRender) this.afterRender(compiledTemplate)
        } catch (error: any) {
            file.setError(error.message, error.stack)

            if(error.hasTemplateError) {
                file.hasTemplateError = true
                file.templateErrorLine = error.templateLine
                file.save()
            }
        }
    }

    getFullFilePath(): string {
        return PathUtil.join(this.getPath(), this.getFilename())
    }

    getFilenameWithoutExtension(): string {
        return this.getFilename().replace(/\.[^/.]+$/, "")
    }

    getFullData() {
        const lang = (key: string) => {
            return `{{ __("${key}") }}`
        }

        return {
            ...this.getData(),
            project: this.project,
            lang: lang,
            filenameWithoutExtension: this.getFilenameWithoutExtension(),
        }
    }

    async compileWithErrorThreatment() {
        try {
            return await this.compile()
        } catch (error: any) {
            if(error.hasTemplateError) {
                console.error(`Error compiling ${this.getTemplateFile()} at line ${error.templateLine}: ${error.message}`)

                error.hasTemplateError = true
                error.templateErrorLine = error.templateLine
            } else {
                console.error(`Error compiling ${this.getTemplateFile()}: ${error.message}`)
            }

            throw error
        }
    }

    async compile() {
        if(!this.project) {
            throw new Error(`Renderable for ${this.getTemplateFile()} doesn't has the project associated. Please set it with setProject() before calling render().`)
        }

        const templateFile = this.getTemplateFile(), 
            templateCompiler = new TemplateCompiler(),
            templateContent = await Main.API.readTemplateFile(templateFile)

        templateCompiler
            .setContent(templateContent)
            .setData(this.getFullData())
            .setVthemeKeys(this.project.getVthemeKeys())
            .setTemplateName(templateFile)

        templateCompiler.setHooksEnabled(this.hooksEnabled)
        if(this.hooks) templateCompiler.setHooks(this.hooks())

        const compiledTemplate = await templateCompiler.compileWithImports()

        return this.formatCompiledTemplate(compiledTemplate)
    }

    async formatCompiledTemplate(compiledTemplate: string) {
        if(this.getFormatter() === RenderableFileFormatter.PHP) {
            return PhpFormatter.setContent(
                compiledTemplate
            ).format()
        }

        if(this.getFormatter() === RenderableFileFormatter.BLADE) {
            return BladeFormatter.setContent(
                compiledTemplate
            ).format()
        }

        return compiledTemplate
    }
}