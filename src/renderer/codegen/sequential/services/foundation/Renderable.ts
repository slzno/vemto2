import Project from "@Common/models/Project"
import Main from "@Renderer/services/wrappers/Main"
import PhpFormatter from "@Renderer/codegen/formatters/PhpFormatter"
import TemplateCompiler from "@Renderer/codegen/templates/base/TemplateCompiler"
import RenderableFile, { RenderableFileFormatter, RenderableFileStatus, RenderableFileType } from "@Common/models/RenderableFile"
import BladeFormatter from "@Renderer/codegen/formatters/BladeFormatter"
import PathUtil from "@Common/util/PathUtil"
import TemplateHelpers from "../helpers/TemplateHelpers"

export interface RenderableDependency {
    name: string
    type: "composer" | "package",
    templatePaths: Set<string>
}

export default abstract class Renderable {
    project: Project
    hooksEnabled: boolean = true
    logEnabled: boolean = false

    static mode: "generate" | "checker" = "generate"

    static dependencies: RenderableDependency[] = []

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

    static setMode(mode: "generate" | "checker") {
        Renderable.mode = mode
    }

    static isCheckerMode() {
        return Renderable.mode === "checker"
    }

    addComposerDependency(name: string) {
        const templatePath = this.getTemplateFile(), 
            dependency = Renderable.dependencies.find(dependency => dependency.name === name)

        if(dependency) {
            dependency.templatePaths.add(templatePath)
            return
        }

        const templatePaths: Set<string> = new Set()

        templatePaths.add(templatePath)

        Renderable.dependencies.push({
            name,
            type: "composer",
            templatePaths
        })
    }

    addPackageDependency(name: string) {
        const templatePath = this.getTemplateFile(), 
            dependency = Renderable.dependencies.find(dependency => dependency.name === name)

        if(dependency) {
            dependency.templatePaths.add(templatePath)
            return
        }

        const templatePaths: Set<string> = new Set()
        
        templatePaths.add(templatePath)

        Renderable.dependencies.push({
            name,
            type: "package",
            templatePaths
        })
    }

    static getComposerDependencies(): RenderableDependency[] {
        return Renderable.dependencies.filter(dependency => dependency.type === "composer")
    }

    static getPackagesDependencies(): RenderableDependency[] {
        return Renderable.dependencies.filter(dependency => dependency.type === "package")
    }

    addDependencies() {
        // Override this method to add dependencies
    }

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
        console.log("Renderable mode", Renderable.mode)

        if(Renderable.isCheckerMode()) {
            this.treatCheckerMode()
            return
        }

        if(!this.canRender()) {
            console.log(`Skipping ${this.getTemplateFile()} for file ${this.getFullFilePath()}...`)
            return
        }

        if(this.beforeRender) this.beforeRender()

        if(this.logEnabled) {
            console.log(`Rendering ${this.getTemplateFile()} as ${this.getFullFilePath()}...`)
        }

        const file = this.registerFile()

        if(file.wasIgnored()) {
            if(this.logEnabled) {
                console.log(`Ignoring ${this.getTemplateFile()} for file ${this.getFullFilePath()}...`)
            }
            
            return
        }

        if(file.wasSkipped() || file.isIdle()) {
            console.log('Skipping file...', this.getTemplateFile())
            if(this.logEnabled) {
                console.log(`Skipping ${this.getTemplateFile()} for file ${this.getFullFilePath()}...`)
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
                file.templateErrorLine = error.templateErrorLine
                file.save()
            }
        }
    }

    registerIdleFile(): RenderableFile {
        return this.project.registerRenderableFile(
            this.getPath(), 
            this.getFilename(),
            this.getTemplateFile(), 
            this.getType(),
            RenderableFileStatus.IDLE
        )
    }

    registerFile(): RenderableFile {
        return this.project.registerRenderableFile(
            this.getPath(), 
            this.getFilename(),
            this.getTemplateFile(), 
            this.getType()
        )
    }

    treatCheckerMode() {
        console.log('Renderable mode is checker, skipping render...')
        
        this.addDependencies()

        this.registerIdleFile()
    }

    getFullFilePath(): string {
        return PathUtil.join(this.getPath(), this.getFilename())
    }

    getFilenameWithoutExtension(): string {
        return this.getFilename().replace(/\.[^/.]+$/, "")
    }

    getFullData() {
        const helpers = new TemplateHelpers(this.project)

        return {
            ...this.getData(),
            project: this.project,
            helpers,
            filenameWithoutExtension: this.getFilenameWithoutExtension(),
        }
    }

    async compileWithErrorThreatment() {
        try {
            return await this.compile()
        } catch (error: any) {
            if(error.hasTemplateError) {
                const templateLine = error.templateErrorLine || error.templateLine || 0

                console.error(`Error compiling ${this.getTemplateFile()} at line ${templateLine}: ${error.message}`)

                error.hasTemplateError = true
                error.templateErrorLine = templateLine
                error.templateName = this.getTemplateFile() || error.templateName || ""
                error.templateLines = error.templateLines || []

                if(error.templateName) {
                    const content = await Main.API.readTemplateFile(error.templateName)
                    error.templateContent = content
                }
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