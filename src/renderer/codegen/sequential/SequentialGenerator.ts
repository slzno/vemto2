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

export default class SequentialGenerator {
    static startTime: number = 0
    static elapsedTime: number = 0

    project: Project

    constructor(project: Project) {
        this.project = project
    }

    async run() {
        SequentialGenerator.startTimer()

        SchemaBuilder.disableSchemaChangesCheck()

        await this.clearVemtoFolders()

        this.project.setFilesQueueStatusProcessing()
        this.project.clearCurrentRenderedFilesPaths()
        this.project.clearRemovedRenderableFiles()

        await new GenerateUiComponentsFiles().start()

        await new GenerateMenu().start()

        await new GenerateRoutes().start(this.project)

        await new GenerateTranslations().start()
        
        await new GenerateModelFiles().start()
        await new GenerateCrudFiles().start()
        await new GenerateFilamentResources().start()
        await new GeneratePageFiles().start()
        
        await new GenerateDatabaseSeeder().start()
        await new GenerateLivewireLayout().start()

        this.project.processRemovableFiles()

        await this.waitForProcessingFilesQueue()

        await this.readSchema()

        SchemaBuilder.enableSchemaChangesCheck()

        SequentialGenerator.stopTimer()
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
