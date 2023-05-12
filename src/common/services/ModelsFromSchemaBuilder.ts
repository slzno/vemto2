import md5 from "crypto-js/md5"
import Model from "@Common/models/Model"
import Project from "@Common/models/Project"
import Relationship from "@Common/models/Relationship"
import RelationshipTypes from "@Common/models/static/RelationshipTypes"

class ModelsFromSchemaBuilder {
    static processing: boolean = false

    project: Project
    schemaModelsData: any
    hasLocalChanges: boolean
    schemaModelsDataHash: string
    changedRelationships: Relationship[] = []

    reset() {
        this.project = null
        this.schemaModelsData = null
        this.hasLocalChanges = false
        this.schemaModelsDataHash = ''
        this.changedRelationships = []
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
        this.setRelatedModels()

        this.reset()

        ModelsFromSchemaBuilder.processing = false
    }

    readModels() {
        const modelsClasses = this.project.getModelsClasses(),
            modelsKeyedByClass = this.project.getAllModelsKeyedByClass()

        // Delete models that no longer exist
        modelsClasses.forEach((modelClass: string) => {
            if(!this.schemaModelsData.find(m => m.class === modelClass)) {
                console.log('deleting model' + modelClass)
                modelsKeyedByClass[modelClass].delete()
            }
        })

        // Create or update models
        this.schemaModelsData.forEach((modelData: any) => {
            let model: Model = null

            if(!modelsClasses.includes(modelData.class)) {
                model = new Model
                model.projectId = this.project.id

                modelsKeyedByClass[modelData.class] = model
            } else {
                model = modelsKeyedByClass[modelData.class]
            }

            model.applyChanges(modelData)

            this.readRelationships(modelData, model)
        })

        this.schemaModelsData.forEach((modelData: any) => {
            let model = modelsKeyedByClass[modelData.class]

            console.log('estou aqui', 'sim estou aqui')
            this.readInverseRelationship(modelData, model, this.schemaModelsData)
        })
    }

    readRelationships(modelData: any, model: Model) {
        const relationshipsNames = model.getRelationshipsNames(),
            relationshipsKeyedByName = model.getAllRelationshipsKeyedByName()

        // Delete relationships that no longer exist
        relationshipsNames.forEach((relationshipName: string) => {
            if(!modelData.relationships.find(r => r.name === relationshipName)) {
                console.log('deleting relationship' + relationshipName + ' from model ' + model.name)
                relationshipsKeyedByName[relationshipName].delete()
            }
        })

        // Create or update relationships
        modelData.relationships.forEach((relationshipData: any) => {
            let relationship: Relationship = null

            if(!relationshipsNames.includes(relationshipData.name)) {
                relationship = new Relationship
                relationship.modelId = model.id

                relationshipsKeyedByName[relationshipData.name] = relationship
            } else {
                relationship = relationshipsKeyedByName[relationshipData.name]
            }

            relationship.applyChanges(relationshipData)

            this.changedRelationships.push(relationship)
        })
    }

    readInverseRelationship(modelData: any, model: Model, schemaModelsData: any) {
        modelData.relationships.forEach((relationshipData: any) => {
            const relatedModelFromRelationshipData = this.project.models.find((model: Model) => model.class === relationshipData.relatedModelName),
                inverseRelationshipType = RelationshipTypes.get()[relationshipData.type].inverse

            if(!relatedModelFromRelationshipData || !inverseRelationshipType) return

            // const inverseRelationshipFromRelatedModel = relatedModelFromRelationshipData.getRelationshipByInverseClassAndType(modelData.class, inverseRelationshipType)

            console.log(relatedModelFromRelationshipData, inverseRelationshipType)
        })
    }

    setRelatedModels() {
        const modelsKeyedByClass = this.project.getAllModelsKeyedByClass()

        this.changedRelationships.forEach((relationship: Relationship) => {
            const relatedModel = modelsKeyedByClass[relationship.relatedModelName]

            if(relatedModel) {
                relationship.relatedModelId = relatedModel.id
            }

            relationship.save()
        })
    }

}

export default new ModelsFromSchemaBuilder