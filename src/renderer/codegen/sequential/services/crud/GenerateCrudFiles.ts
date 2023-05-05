import Crud from "@Common/models/crud/Crud"
import RenderableIndexPage from "./views/default/RenderableIndexPage"

export default class GenerateCrudFiles {
    async start() {
        const cruds = Crud.get()

        for (const crud of cruds) {
            await new RenderableIndexPage(crud).render()
        }
    }
}
