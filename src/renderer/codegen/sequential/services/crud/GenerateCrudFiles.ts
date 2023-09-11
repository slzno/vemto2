import Crud from "@Common/models/crud/Crud"
import RenderableLivewireIndexView from "./views/livewire/RenderableLivewireIndexView"
import RenderableLivewireIndexComponent from "./views/livewire/RenderableLivewireIndexComponent"
import RenderableLivewireCreateView from "./views/livewire/RenderableLivewireCreateView"
import RenderableLivewireCreateComponent from "./views/livewire/RenderableLivewireCreateComponent"
import RenderableLivewireEditView from "./views/livewire/RenderableLivewireEditView"
import RenderableLivewireEditComponent from "./views/livewire/RenderableLivewireEditComponent"
import RenderableLivewireHasManyDetailComponent from "./views/livewire/RenderableLivewireHasManyDetailComponent"
import RenderableLivewireHasManyDetailView from "./views/livewire/RenderableLivewireHasManyDetailView"
import RenderableLivewireCreateFormComponent from "./views/livewire/RenderableLivewireCreateFormComponent"
import RenderableLivewireUpdateFormComponent from "./views/livewire/RenderableLivewireUpdateFormComponent"

export default class GenerateCrudFiles {
    async start() {
        const cruds = Crud.getBasic()

        for (const crud of cruds) {
            await new RenderableLivewireIndexView(crud).render()
            await new RenderableLivewireIndexComponent(crud).render()

            await new RenderableLivewireCreateView(crud).render()
            await new RenderableLivewireCreateComponent(crud).render()
            
            await new RenderableLivewireEditView(crud).render()
            await new RenderableLivewireEditComponent(crud).render()

            await new RenderableLivewireCreateFormComponent(crud).render()
            await new RenderableLivewireUpdateFormComponent(crud).render()

            crud.hasManyDetails.forEach(async hasManyDetail => {
                await new RenderableLivewireHasManyDetailView(hasManyDetail).render()
                await new RenderableLivewireHasManyDetailComponent(hasManyDetail).render()
            })
        }
    }
}
