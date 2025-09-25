import Crud from "@Common/models/crud/Crud"
import Project from "@Common/models/Project"
import ReactIndexPageRenderable from "@Renderer/codegen/sequential/services/crud/react/pages/ReactIndexPageRenderable"
import ReactCreatePageRenderable from "@Renderer/codegen/sequential/services/crud/react/pages/ReactCreatePageRenderable"
import ReactEditPageRenderable from "@Renderer/codegen/sequential/services/crud/react/pages/ReactEditPageRenderable"
import ReactSowPageRenderable from "@Renderer/codegen/sequential/services/crud/react/pages/ReactSowPageRenderable"
import ReactFormRenderable from "@Renderer/codegen/sequential/services/crud/react/pages/form/ReactFormRenderable"
import ReactTableRenderable from "@Renderer/codegen/sequential/services/crud/react/pages/tables/ReactTableRenderable"
import ReactRouteWebRenderable from "@Renderer/codegen/sequential/services/crud/react/routes/ReactRouteWebRenderable"
import ReactRouteAppRenderable from "@Renderer/codegen/sequential/services/crud/react/routes/ReactRouteAppRenderable"
import ReactEntityRenderable
    from "@Renderer/codegen/sequential/services/crud/react/pages/entities/ReactEntityRenderable"
import ReactControllerRenderable
    from "@Renderer/codegen/sequential/services/crud/react/controllers/ReactControllerRenderable"

export default class GenerateReactFiles {
    async start(project: Project) {
        const cruds = Crud.getBasic()

        for (const crud of cruds) {
            /* React Pages */
            await new ReactIndexPageRenderable(crud).render()
            await new ReactCreatePageRenderable(crud).render()
            await new ReactEditPageRenderable(crud).render()
            await new ReactSowPageRenderable(crud).render()

            /* React Form */
            await new ReactEntityRenderable(crud).render()
            await new ReactFormRenderable(crud).render()
            await new ReactTableRenderable(crud).render()

            await new ReactRouteWebRenderable(cruds).render()
            await new ReactRouteAppRenderable(crud).render()
            await new ReactControllerRenderable(crud).render()

            /*await new LivewireIndexViewRenderable(crud).render()
            await new LivewireIndexComponentRenderable(crud).render()

            await new LivewireCreateViewRenderable(crud).render()
            await new LivewireCreateComponentRenderable(crud).render()
            
            await new LivewireEditViewRenderable(crud).render()
            await new LivewireEditComponentRenderable(crud).render()

            await new LivewireCreateFormComponentRenderable(crud).render()
            await new LivewireUpdateFormComponentRenderable(crud).render()

            for (const hasManyDetail of crud.hasManyDetails) {
                await new LivewireHasManyDetailViewRenderable(hasManyDetail).render()
                await new LivewireHasManyDetailComponentRenderable(hasManyDetail).render()

                await new LivewireCreateDetailFormComponentRenderable(hasManyDetail).render()
                await new LivewireUpdateDetailFormComponentRenderable(hasManyDetail).render()
            }*/
        }
    }
}
