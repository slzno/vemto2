import Project from "@Common/models/Project"
import GenerateMenu from "./services/menu/GenerateMenu"
import GenerateRoutes from "./services/routes/GenerateRoutes"
import GenerateTranslations from "./services/translations/GenerateTranslations"
import GenerateCrudFiles from "./services/crud/GenerateCrudFiles"
import GenerateModelFiles from "./services/model/GenerateModelFiles"
import GeneratePageFiles from "./services/page/GeneratePageFiles"
import GenerateUiComponentsFiles from "./services/blade/ui/GenerateUiComponentsFiles"
import SchemaBuilder from "@Renderer/services/schema/SchemaBuilder"
import Main from "@Renderer/services/wrappers/Main"
import GenerateDatabaseSeeder from "./services/database/GenerateDatabaseSeeder"
import GenerateFilamentResources from "./services/crud/GenerateFilamentResources"
import GenerateLivewireLayout from "./services/crud/GenerateLivewireLayout"
import Renderable from "./services/foundation/Renderable"
import PackageChecker from "./services/PackageChecker"
import RenderableFile from "@Common/models/RenderableFile"

export default class SequentialGenerator {
    static startTime: number = 0
    static elapsedTime: number = 0
    
    project: Project
    static running: boolean = false

    packageChecker: PackageChecker

    constructor(project: Project) {
        this.project = project

        this.packageChecker = new PackageChecker(project)
    }

    static isRunning(): boolean {
        return SequentialGenerator.running
    }

    async run(): Promise<void> {
        try {
            await this.runGeneration()
        } catch (error) {
            console.error("Error while running generation: ", error)
            
            throw error
        }
    }

    async runGeneration(): Promise<boolean> {
        if(SequentialGenerator.running) {
            throw new Error("Generation is already running")
        }

        SequentialGenerator.running = true

        SequentialGenerator.startTimer()

        SchemaBuilder.disableSchemaChangesCheck()

        await this.clearVemtoFolders()

        this.project.setFilesQueueStatusProcessing()
        this.project.clearCurrentRenderedFilesPaths()
        this.project.clearRemovedRenderableFiles()
        
        this.project.clearSkippedRenderableFiles()
        
        await this.calculateSkippedFilesByMissingDependencies()

        await this.runGeneratorsServices()

        this.project.processRemovableFiles()

        await this.waitForProcessingFilesQueue()

        await this.readSchema()

        SchemaBuilder.enableSchemaChangesCheck()

        SequentialGenerator.stopTimer()

        SequentialGenerator.running = false

        return true
    }

    async calculateSkippedFilesByMissingDependencies() {
        let templatePaths = []

        const composerMissingDependencies = this.packageChecker.getComposerMissingDependencies(),
            packagesMissingDependencies = this.packageChecker.getPackagesMissingDependencies()

        composerMissingDependencies.forEach((dependency) => {
            templatePaths.push(...dependency.templatePaths)
        })

        packagesMissingDependencies.forEach((dependency) => {
            templatePaths.push(...dependency.templatePaths)
        })

        templatePaths = [...new Set(templatePaths)]

        templatePaths.forEach((path: string) => {
            const renderableFile: RenderableFile = this.project.getRenderableFileByTemplatePath(path)

            if(!renderableFile) return

            renderableFile.setAsSkipped()
        })
    }

    hasMissingDependencies(): boolean {
        return this.packageChecker.hasMissingDependencies()
    }

    async checkDependencies(): Promise<void> {
        Renderable.setMode("checker")

        await this.runGeneratorsServices()

        await this.packageChecker.checkForMissingDependencies()

        Renderable.setMode("generate")
    }

    async runGeneratorsServices() {
        await new GenerateUiComponentsFiles().start()

        await new GenerateMenu().start(this.project)

        await new GenerateRoutes().start(this.project)

        await new GenerateTranslations().start()
        
        await new GenerateModelFiles().start()
        await new GenerateCrudFiles().start()
        await new GenerateFilamentResources().start()
        await new GeneratePageFiles().start()
        
        await new GenerateDatabaseSeeder().start()
        await new GenerateLivewireLayout().start()
    }

    async clearVemtoFolders() {
        await Main.API.clearProjectFolder(".vemto/conflicts")
        await Main.API.clearProjectFolder(".vemto/processed-files")
    }

    async waitForProcessingFilesQueue() {
        while(this.project.fresh().processingFilesQueue()) {
            await new Promise(resolve => setTimeout(resolve, 500))
        }
    }

    async readSchema() {
        this.project.ignoreNextSchemaSourceChanges()

        const schemaBuilder = new SchemaBuilder(this.project)

        await schemaBuilder.buildModels()
    }

    static startTimer(): void {
        this.startTime = Date.now()
    }

    static stopTimer(): void {
        this.elapsedTime = Date.now() - this.startTime
    }

    static getElapsedTimeInSeconds(): number {
        return this.elapsedTime / 1000
    }

    static getElapsedTime(): number {
        return this.elapsedTime
    }
}
