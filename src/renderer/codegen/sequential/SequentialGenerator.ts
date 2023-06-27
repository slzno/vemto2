import Project from "@Common/models/Project"
import GenerateMenu from "./services/menu/GenerateMenu"
import GenerateRoutes from "./services/routes/GenerateRoutes"
import GenerateCrudFiles from "./services/crud/GenerateCrudFiles"
import GenerateModelFiles from "./services/model/GenerateModelFiles"
import GeneratePageFiles from "./services/page/GeneratePageFiles"
import GenerateUiComponentsFiles from "./services/blade/ui/GenerateUiComponentsFiles"

export default class SequentialGenerator {
    async run(project: Project) {
        project.clearCurrentRenderedFilesPaths()

        await new GenerateUiComponentsFiles().start()

        await new GenerateMenu().start()
        await new GenerateRoutes().start()
        
        await new GenerateModelFiles().start()
        await new GenerateCrudFiles().start()
        await new GeneratePageFiles().start()

        project.processRemovableFiles()
    }
}
