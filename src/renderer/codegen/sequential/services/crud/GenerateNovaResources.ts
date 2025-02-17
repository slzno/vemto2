import Crud from "@Common/models/crud/Crud"
import NovaResourceRenderable from "./views/nova/NovaResourceRenderable"
import NovaManyToManyResourceRenderable from "./views/nova/NovaManyToManyResourceRenderable"

export default class GenerateNovaResources {
    async start() {
        const cruds = Crud.getNovaResources()

        for (const crud of cruds) {
            await new NovaResourceRenderable(crud).render()

            for(const hasManyDetail of crud.hasManyDetails) {
                await new NovaResourceRenderable(hasManyDetail.detailCrud).render()
            }

            for(const morphManyDetail of crud.morphManyDetails) {
                await new NovaResourceRenderable(morphManyDetail.detailCrud).render()
            }

            for(const belongsToManyDetail of crud.belongsToManyDetails) {
                await new NovaManyToManyResourceRenderable(belongsToManyDetail).render()
            }

            for(const morphToManyDetail of crud.morphToManyDetails) {
                await new NovaManyToManyResourceRenderable(morphToManyDetail).render()
            }
        }
    }
}
