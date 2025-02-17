import Crud from "@Common/models/crud/Crud"
import LivewireIndexViewRenderable from "./views/livewire/LivewireIndexViewRenderable"
import LivewireIndexComponentRenderable from "./views/livewire/LivewireIndexComponentRenderable"
import LivewireCreateViewRenderable from "./views/livewire/LivewireCreateViewRenderable"
import LivewireCreateComponentRenderable from "./views/livewire/LivewireCreateComponentRenderable"
import LivewireEditViewRenderable from "./views/livewire/LivewireEditViewRenderable"
import LivewireEditComponentRenderable from "./views/livewire/LivewireEditComponentRenderable"
import LivewireHasManyDetailComponentRenderable from "./views/livewire/LivewireHasManyDetailComponentRenderable"
import LivewireHasManyDetailViewRenderable from "./views/livewire/LivewireHasManyDetailViewRenderable"
import LivewireCreateFormComponentRenderable from "./views/livewire/LivewireCreateFormComponentRenderable"
import LivewireCreateDetailFormComponentRenderable from "./views/livewire/LivewireCreateDetailFormComponentRenderable"
import LivewireUpdateFormComponentRenderable from "./views/livewire/LivewireUpdateFormComponentRenderable"
import LivewireUpdateDetailFormComponentRenderable from "./views/livewire/LivewireUpdateDetailFormComponentRenderable"
import HasManyDetail from "@Common/models/crud/HasManyDetail"

export default class GenerateCrudFiles {
    async start() {
        const cruds = Crud.getBasic()

        for (const crud of cruds) {
            await new LivewireIndexViewRenderable(crud).render()
            await new LivewireIndexComponentRenderable(crud).render()

            await new LivewireCreateViewRenderable(crud).render()
            await new LivewireCreateComponentRenderable(crud).render()
            
            await new LivewireEditViewRenderable(crud).render()
            await new LivewireEditComponentRenderable(crud).render()

            await new LivewireCreateFormComponentRenderable(crud).render()
            await new LivewireUpdateFormComponentRenderable(crud).render()

            crud.hasManyDetails.forEach(async (hasManyDetail: HasManyDetail) => {
                await new LivewireHasManyDetailViewRenderable(hasManyDetail).render()
                await new LivewireHasManyDetailComponentRenderable(hasManyDetail).render()

                await new LivewireCreateDetailFormComponentRenderable(hasManyDetail).render()
                await new LivewireUpdateDetailFormComponentRenderable(hasManyDetail).render()
            })
        }
    }
}
