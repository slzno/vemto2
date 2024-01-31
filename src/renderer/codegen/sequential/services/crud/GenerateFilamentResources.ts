import Crud from "@Common/models/crud/Crud"
import HasManyDetail from "@Common/models/crud/HasManyDetail"
import MorphManyDetail from "@Common/models/crud/MorphManyDetail"
import RenderableFilamentResource from "./views/filament/RenderableFilamentResource"
import RenderableFilamentEditComponent from "./views/filament/RenderableFilamentEditComponent"
import RenderableFilamentListComponent from "./views/filament/RenderableFilamentListComponent"
import RenderableFilamentViewComponent from "./views/filament/RenderableFilamentViewComponent"
import RenderableFilamentCreateComponent from "./views/filament/RenderableFilamentCreateComponent"
import RenderableFilamentCommonRelationManager from "./views/filament/RenderableFilamentCommonRelationManager"
import RenderableFilamentBelongsToManyRelationManager from "./views/filament/RenderableFilamentBelongsToManyRelationManager"
import BelongsToManyDetail from "@Common/models/crud/BelongsToManyDetail"
import MorphToManyDetail from "@Common/models/crud/MorphToManyDetail"
import RenderableFilamentMorphToManyRelationManager from "./views/filament/RenderableFilamentMorphToManyRelationManager"

export default class GenerateFilamentResources {
    async start() {
        const resources = Crud.getFilamentResources()

        for (const resource of resources) {
            await new RenderableFilamentResource(resource).render()
            await new RenderableFilamentCreateComponent(resource).render()
            await new RenderableFilamentViewComponent(resource).render()
            await new RenderableFilamentEditComponent(resource).render()
            await new RenderableFilamentListComponent(resource).render()

            resource.hasManyDetails.forEach(async (hasManyDetail: HasManyDetail) => {
                await new RenderableFilamentCommonRelationManager(hasManyDetail).render()
            })

            resource.morphManyDetails.forEach(async (morphManyDetail: MorphManyDetail) => {
                await new RenderableFilamentCommonRelationManager(morphManyDetail).render()
            })

            resource.belongsToManyDetails.forEach(async (belongsToManyDetail: BelongsToManyDetail) => {
                await new RenderableFilamentBelongsToManyRelationManager(belongsToManyDetail).render()
            })

            resource.morphToManyDetails.forEach(async (morphToManyDetail: MorphToManyDetail) => {
                await new RenderableFilamentMorphToManyRelationManager(morphToManyDetail).render()
            })
        }
    }
}
