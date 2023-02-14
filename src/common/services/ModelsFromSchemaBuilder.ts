import md5 from "crypto-js/md5"
import Model from "@Common/models/Model"
import Project from "@Common/models/Project"
import Relationship from "@Common/models/Relationship"

class ModelsFromSchemaBuilder {
    static processing: boolean = false

    project: Project
    schemaModelsData: any
    hasLocalChanges: boolean
    schemaModelsDataHash: string

    reset() {
        this.project = null
        this.schemaModelsData = null
        this.hasLocalChanges = false
        this.schemaModelsDataHash = ''
    }

    setProject(project: Project) {
        this.project = project
        return this
    }

    hasSchemaChanges() {
        return this.hasLocalChanges
    }
    
    doesNotHaveSchemaChanges() {
        return !this.hasLocalChanges
    }

    setSchemaData(schemaData: any) {
        this.schemaModelsData = schemaData.models
        return this
    }

    async build() {
        if(ModelsFromSchemaBuilder.processing) return

        this.processModels()
    }

    async checkSchemaChanges() {
        this.schemaModelsDataHash = md5(JSON.stringify(this.schemaModelsData)).toString()
        
        if (this.project.schemaModelsDataHash === this.schemaModelsDataHash) {
            return
        }

        this.hasLocalChanges = true

        this.project.schemaModelsDataHash = this.schemaModelsDataHash
        this.project.save()

        return this
    }

    force() {
        this.hasLocalChanges = true
        
        return this
    }


    processModels() {
        if(!this.hasLocalChanges) return

        ModelsFromSchemaBuilder.processing = true

        this.readModels()

        this.reset()

        ModelsFromSchemaBuilder.processing = false
    }

    readModels() {
        const modelsNames = this.project.getModelsNames(),
            modelsKeyedByName = this.project.getAllModelsKeyedByName()

        // Delete models that no longer exist
        modelsNames.forEach((modelName: string) => {
            if(!this.schemaModelsData[modelName]) {
                modelsKeyedByName[modelName].delete()
            }
        })

        // Create or update models
        Object.keys(this.schemaModelsData).forEach((modelName: string) => {
            let modelData = this.schemaModelsData[modelName],
                model: Model = null

            if(!modelsNames.includes(modelName)) {
                model = new Model
                model.projectId = this.project.id

                modelsKeyedByName[modelName] = model
            } else {
                model = modelsKeyedByName[modelName]
            }

            model.applyChanges(modelData)

            this.readRelationships(modelData, model, modelsKeyedByName)
        })
    }

    readRelationships(modelData: any, model: Model, modelsKeyedByName: any) {
        const relationshipsNames = model.getRelationshipsNames(),
            relationshipsKeyedByName = model.getAllRelationshipsKeyedByName()

        // Delete relationships that no longer exist
        relationshipsNames.forEach((relationshipName: string) => {
            if(!modelData.relationships[relationshipName]) {
                relationshipsKeyedByName[relationshipName].delete()
            }
        })

        // Create or update relationships
        Object.keys(modelData.relationships).forEach((relationshipName: string) => {
            let relationshipData = modelData.relationships[relationshipName],
                relationship: Relationship = null

            if(!relationshipsNames.includes(relationshipName)) {
                relationship = new Relationship
                relationship.modelId = model.id

                const relatedModel = modelsKeyedByName[relationshipData.relatedModelName]

                if(relatedModel) {
                    relationship.relatedModelId = relatedModel.id
                }

                relationshipsKeyedByName[relationshipName] = relationship
            } else {
                relationship = relationshipsKeyedByName[relationshipName]
            }

            relationship.applyChanges(relationshipData)
        })
    }

}

export default new ModelsFromSchemaBuilder