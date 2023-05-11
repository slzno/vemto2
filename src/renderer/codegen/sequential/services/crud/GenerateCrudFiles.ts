import Crud from "@Common/models/crud/Crud"
import RenderableLivewireIndexView from "./views/livewire/RenderableLivewireIndexView"
import RenderableLivewireIndexComponent from "./views/livewire/RenderableLivewireIndexComponent"
import RenderableLivewireCreateView from "./views/livewire/RenderableLivewireCreateView"
import RenderableLivewireCreateComponent from "./views/livewire/RenderableLivewireCreateComponent"
import RenderableLivewireEditView from "./views/livewire/RenderableLivewireEditView"
import RenderableLivewireEditComponent from "./views/livewire/RenderableLivewireEditComponent"

export default class GenerateCrudFiles {
    async start() {
        const cruds = Crud.get()

        for (const crud of cruds) {
            await new RenderableLivewireIndexView(crud).render()
            await new RenderableLivewireIndexComponent(crud).render()
            await new RenderableLivewireCreateView(crud).render()
            await new RenderableLivewireCreateComponent(crud).render()
            await new RenderableLivewireEditView(crud).render()
            await new RenderableLivewireEditComponent(crud).render()
        }
    }
}
