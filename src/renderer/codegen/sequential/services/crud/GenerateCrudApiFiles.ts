import Crud from "@Common/models/crud/Crud"
import RenderableApiController from "./controllers/RenderableApiController"
import RenderableApiResource from "./api/RenderableApiResource"
import RenderableApiCollection from "./api/RenderableApiCollection"
import RenderableApiStoreRequest from "./api/RenderableApiStoreRequest"
import RenderableApiUpdateRequest from "./api/RenderableApiUpdateRequest"
import RenderableApiTest from "./api/RenderableApiTest"
import Relationship from "@Common/models/Relationship"
import RenderableApiHasManyController from "./controllers/RenderableApiHasManyController"

export default class GenerateCrudApiFiles {
    async start() {
        const cruds = Crud.getApis()

        for (const crud of cruds) {
            await new RenderableApiStoreRequest(crud).render()
            await new RenderableApiUpdateRequest(crud).render()

            await new RenderableApiCollection(crud.model).render()
            await new RenderableApiResource(crud.model).render()
            
            await new RenderableApiController(crud).render()

            await new RenderableApiTest(crud).render()

            await crud.model.getHasManyRelations().forEach(async (relationship: Relationship) => {
                await new RenderableApiResource(relationship.model).render()
                await new RenderableApiCollection(relationship.model).render()

                await new RenderableApiHasManyController(crud, relationship).render()
            })
        }
    }
}
