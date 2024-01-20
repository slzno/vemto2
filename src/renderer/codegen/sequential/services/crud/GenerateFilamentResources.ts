import Crud from "@Common/models/crud/Crud"
import RenderableFilamentResource from "./views/filament/RenderableFilamentResource"
import RenderableFilamentCreateComponent from "./views/filament/RenderableFilamentCreateComponent"
import RenderableFilamentEditComponent from "./views/filament/RenderableFilamentEditComponent"
import RenderableFilamentListComponent from "./views/filament/RenderableFilamentListComponent"
import RenderableFilamentViewComponent from "./views/filament/RenderableFilamentViewComponent"
import HasManyDetail from "@Common/models/crud/HasManyDetail"
import RenderableFilamentRelationManager from "./views/filament/RenderableFilamentRelationManager"

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
                console.log(hasManyDetail.detailCrud.getInputsForForms())
                await new RenderableFilamentRelationManager(hasManyDetail).render()
            })
        }
    }
}
