import GenerateRoutes from "./services/routes/GenerateRoutes"
import GenerateCrudFiles from "./services/crud/GenerateCrudFiles"
import GenerateModelFiles from "./services/model/GenerateModelFiles"

export default class SequentialGenerator {
    async run() {
        await new GenerateRoutes().start()
        await new GenerateModelFiles().start()
        await new GenerateCrudFiles().start()
    }
}
