import Crud from "@Common/models/crud/Crud"
import HasManyDetail from "@Common/models/crud/HasManyDetail"
import MorphManyDetail from "@Common/models/crud/MorphManyDetail"
import FilamentResourceRenderable from "./views/filament/FilamentResourceRenderable"
import FilamentEditComponentRenderable from "./views/filament/FilamentEditComponentRenderable"
import FilamentListComponentRenderable from "./views/filament/FilamentListComponentRenderable"
import FilamentViewComponentRenderable from "./views/filament/FilamentViewComponentRenderable"
import FilamentCreateComponentRenderable from "./views/filament/FilamentCreateComponentRenderable"
import FilamentCommonRelationManagerRenderable from "./views/filament/FilamentCommonRelationManagerRenderable"
import FilamentBelongsToManyRelationManagerRenderable from "./views/filament/FilamentBelongsToManyRelationManagerRenderable"
import BelongsToManyDetail from "@Common/models/crud/BelongsToManyDetail"
import MorphToManyDetail from "@Common/models/crud/MorphToManyDetail"
import FilamentMorphToManyRelationManagerRenderable from "./views/filament/FilamentMorphToManyRelationManagerRenderable"

export default class GenerateFilamentResources {
    async start() {
        const resources = Crud.getFilamentResources()

        for (const resource of resources) {
            await new FilamentResourceRenderable(resource).render()
            await new FilamentCreateComponentRenderable(resource).render()
            await new FilamentViewComponentRenderable(resource).render()
            await new FilamentEditComponentRenderable(resource).render()
            await new FilamentListComponentRenderable(resource).render()

            resource.hasManyDetails.forEach(async (hasManyDetail: HasManyDetail) => {
                await new FilamentCommonRelationManagerRenderable(hasManyDetail).render()
            })

            resource.morphManyDetails.forEach(async (morphManyDetail: MorphManyDetail) => {
                await new FilamentCommonRelationManagerRenderable(morphManyDetail).render()
            })

            resource.belongsToManyDetails.forEach(async (belongsToManyDetail: BelongsToManyDetail) => {
                await new FilamentBelongsToManyRelationManagerRenderable(belongsToManyDetail).render()
            })

            resource.morphToManyDetails.forEach(async (morphToManyDetail: MorphToManyDetail) => {
                await new FilamentMorphToManyRelationManagerRenderable(morphToManyDetail).render()
            })
        }
    }
}
