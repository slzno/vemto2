import Crud from "@Common/models/crud/Crud"
import RenderableApiController from "./controllers/RenderableApiController"
import RenderableApiResource from "./api/RenderableApiResource"
import RenderableApiCollection from "./api/RenderableApiCollection"
import RenderableApiStoreRequest from "./api/RenderableApiStoreRequest"
import RenderableApiUpdateRequest from "./api/RenderableApiUpdateRequest"
import RenderableApiTest from "./api/RenderableApiTest"
import Relationship from "@Common/models/Relationship"
import RenderableApiHasManyController from "./controllers/RenderableApiHasManyController"
import RenderableApiHasManyTest from "./api/RenderableApiHasManyTest"
import RenderableApiBelongsToManyController from "./controllers/RenderableApiBelongsToManyController"
import RenderableApiBelongsToManyTest from "./api/RenderableApiBelongsToManyTest"
import RenderableApiAuthController from "./controllers/RenderableApiAuthController"
import Project from "@Common/models/Project"

export default class GenerateCrudApiFiles {
    async start(project: Project) {
        const cruds = Crud.getApis()

        if(!cruds.length) return
        
        await new RenderableApiAuthController(project.getAuthModel()).render()

        for (const crud of cruds) {
            await new RenderableApiStoreRequest(crud).render()
            await new RenderableApiUpdateRequest(crud).render()

            await new RenderableApiCollection(crud.model).render()
            await new RenderableApiResource(crud.model).render()
            
            await new RenderableApiController(crud).render()

            await new RenderableApiTest(crud).render()

            await crud.model.getHasManyRelations().forEach(async (relationship: Relationship) => {
                await new RenderableApiResource(relationship.relatedModel).render()
                await new RenderableApiCollection(relationship.relatedModel).render()

                await new RenderableApiHasManyController(crud, relationship).render()
                
                await new RenderableApiHasManyTest(crud, relationship).render()
            })

            await crud.model.getBelongsToManyRelations().forEach(async (relationship: Relationship) => {
                await new RenderableApiResource(relationship.relatedModel).render()
                await new RenderableApiCollection(relationship.relatedModel).render()

                await new RenderableApiBelongsToManyController(crud, relationship).render()
                await new RenderableApiBelongsToManyTest(crud, relationship).render()
            })
        }
    }
}
