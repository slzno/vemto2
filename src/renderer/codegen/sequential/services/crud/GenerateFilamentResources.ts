import Crud from "@Common/models/crud/Crud"
import RenderableFilamentResource from "./views/filament/RenderableFilamentResource"
import RenderableFilamentCreateComponent from "./views/filament/RenderableFilamentCreateComponent"
import RenderableFilamentEditComponent from "./views/filament/RenderableFilamentEditComponent"
import RenderableFilamentListComponent from "./views/filament/RenderableFilamentListComponent"
import RenderableFilamentViewComponent from "./views/filament/RenderableFilamentViewComponent"

export default class GenerateFilamentResources {
    async start() {
        const resources = Crud.getFilamentResources()

        for (const resource of resources) {
            await new RenderableFilamentResource(resource).render()
            await new RenderableFilamentCreateComponent(resource).render()
            await new RenderableFilamentViewComponent(resource).render()
            await new RenderableFilamentEditComponent(resource).render()
            await new RenderableFilamentListComponent(resource).render()
        }
    }
}
