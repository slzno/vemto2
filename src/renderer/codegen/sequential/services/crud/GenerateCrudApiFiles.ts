import Crud from "@Common/models/crud/Crud"
import RenderableApiController from "./controllers/RenderableApiController"

export default class GenerateCrudApiFiles {
    async start() {
        const cruds = Crud.getApis()

        for (const crud of cruds) {
            await new RenderableApiController(crud).render()
        }
    }
}
