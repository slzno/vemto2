import Crud from "@Common/models/crud/Crud"
import RenderableLivewireIndexView from "./views/livewire/RenderableLivewireIndexView"
import RenderableLivewireIndexComponent from "./views/livewire/RenderableLivewireIndexComponent"

export default class GenerateCrudFiles {
    async start() {
        const cruds = Crud.get()

        for (const crud of cruds) {
            await new RenderableLivewireIndexView(crud).render()
            await new RenderableLivewireIndexComponent(crud).render()
        }
    }
}
