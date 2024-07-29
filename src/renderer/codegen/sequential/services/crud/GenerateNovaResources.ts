import Crud from "@Common/models/crud/Crud"
import RenderableNovaResource from "./views/nova/RenderableNovaResource"
import RenderableNovaManyToManyResource from "./views/nova/RenderableNovaManyToManyResource"

export default class GenerateNovaResources {
    async start() {
        const cruds = Crud.getNovaResources()

        for (const crud of cruds) {
            await new RenderableNovaResource(crud).render()

            for(const hasManyDetail of crud.hasManyDetails) {
                await new RenderableNovaResource(hasManyDetail.detailCrud).render()
            }

            for(const morphManyDetail of crud.morphManyDetails) {
                await new RenderableNovaResource(morphManyDetail.detailCrud).render()
            }

            for(const belongsToManyDetail of crud.belongsToManyDetails) {
                await new RenderableNovaManyToManyResource(belongsToManyDetail).render()
            }

            for(const morphToManyDetail of crud.morphToManyDetails) {
                await new RenderableNovaManyToManyResource(morphToManyDetail).render()
            }
        }
    }
}
