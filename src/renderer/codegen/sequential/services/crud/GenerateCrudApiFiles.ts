import Crud from "@Common/models/crud/Crud"
import ApiControllerRenderable from "./controllers/ApiControllerRenderable"
import ApiResourceRenderable from "./api/ApiResourceRenderable"
import ApiCollectionRenderable from "./api/ApiCollectionRenderable"
import ApiStoreRequestRenderable from "./api/ApiStoreRequestRenderable"
import ApiUpdateRequestRenderable from "./api/ApiUpdateRequestRenderable"
import ApiTestRenderable from "./api/ApiTestRenderable"
import Relationship from "@Common/models/Relationship"
import ApiHasManyControllerRenderable from "./controllers/ApiHasManyControllerRenderable"
import ApiHasManyTestRenderable from "./api/ApiHasManyTestRenderable"
import ApiBelongsToManyControllerRenderable from "./controllers/ApiBelongsToManyControllerRenderable"
import ApiBelongsToManyTestRenderable from "./api/ApiBelongsToManyTestRenderable"
import ApiAuthControllerRenderable from "./controllers/ApiAuthControllerRenderable"
import Project from "@Common/models/Project"

export default class GenerateCrudApiFiles {
    async start(project: Project) {
        const cruds = Crud.getApis()

        if(!cruds.length) return
        
        await new ApiAuthControllerRenderable(project.getAuthModel()).render()

        for (const crud of cruds) {
            await new ApiStoreRequestRenderable(crud).render()
            await new ApiUpdateRequestRenderable(crud).render()

            await new ApiCollectionRenderable(crud.model).render()
            await new ApiResourceRenderable(crud.model).render()
            
            await new ApiControllerRenderable(crud).render()

            await new ApiTestRenderable(crud).render()

            await crud.model.getHasManyRelations().forEach(async (relationship: Relationship) => {
                await new ApiResourceRenderable(relationship.relatedModel).render()
                await new ApiCollectionRenderable(relationship.relatedModel).render()

                await new ApiHasManyControllerRenderable(crud, relationship).render()
                
                await new ApiHasManyTestRenderable(crud, relationship).render()
            })

            await crud.model.getBelongsToManyRelations().forEach(async (relationship: Relationship) => {
                await new ApiResourceRenderable(relationship.relatedModel).render()
                await new ApiCollectionRenderable(relationship.relatedModel).render()

                await new ApiBelongsToManyControllerRenderable(crud, relationship).render()
                await new ApiBelongsToManyTestRenderable(crud, relationship).render()
            })
        }
    }
}
