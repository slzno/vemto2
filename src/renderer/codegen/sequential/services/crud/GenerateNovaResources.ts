import Crud from "@Common/models/crud/Crud"
import RenderableNovaResource from "./views/nova/RenderableNovaResource"

export default class GenerateNovaResources {
    async start() {
        const cruds = Crud.getNovaResources()

        for (const crud of cruds) {
            await new RenderableNovaResource(crud).render()
        }
    }
}
