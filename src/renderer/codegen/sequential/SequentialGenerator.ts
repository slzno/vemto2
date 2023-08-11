import Project from "@Common/models/Project"
import GenerateMenu from "./services/menu/GenerateMenu"
import GenerateRoutes from "./services/routes/GenerateRoutes"
import GenerateCrudFiles from "./services/crud/GenerateCrudFiles"
import GenerateModelFiles from "./services/model/GenerateModelFiles"
import GeneratePageFiles from "./services/page/GeneratePageFiles"
import GenerateUiComponentsFiles from "./services/blade/ui/GenerateUiComponentsFiles"

export default class SequentialGenerator {
    static startTime: number = 0
    static elapsedTime: number = 0

    async run(project: Project) {
        SequentialGenerator.startTimer()

        project.clearCurrentRenderedFilesPaths()

        await new GenerateUiComponentsFiles().start()

        await new GenerateMenu().start()
        await new GenerateRoutes().start()
        
        await new GenerateModelFiles().start()
        await new GenerateCrudFiles().start()
        await new GeneratePageFiles().start()

        project.processRemovableFiles()

        SequentialGenerator.stopTimer()
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
