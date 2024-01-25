import Model from "@Common/models/Model"
import Project from "@Common/models/Project"
import Relationship from "@Common/models/Relationship"
import RelationshipTypes from "@Common/models/static/RelationshipTypes"

export default class ModelsBuilder {
    static processing: boolean = false

    project: Project
    schemaModelsData: any
    changedRelationships: Relationship[] = []

    constructor(project: Project) {
        this.project = project
    }

    reset() {
        this.project = null
        this.schemaModelsData = null
        this.changedRelationships = []
    }

    setSchemaData(schemaData: any) {
        this.schemaModelsData = schemaData.models
        return this
    }

    async build() {
        if(ModelsBuilder.processing) return

        await this.project.undoAllModelsChanges()

        this.processModels()

        return true
    }

    processModels() {
        ModelsBuilder.processing = true

        this.readModels()
        this.setRelatedModels()
        this.readInverseRelationships()

        this.reset()

        ModelsBuilder.processing = false
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
            let model: Model = null,
                isCreating = false

            try {
                if(!modelsClasses.includes(modelData.class)) {
                    isCreating = true

                    model = new Model
                    model.projectId = this.project.id
    
                    modelsKeyedByClass[modelData.class] = model
                } else {
                    model = modelsKeyedByClass[modelData.class]
                    model.markAsNotRemoved()
                }
    
                Model.savingInternally()
                model.applyChanges(modelData)
                
                if(isCreating) {
                    model.generateDefaultData()
                    model.save()
                }

                Model.notSavingInternally()
    
                this.readRelationships(modelData, model)
            } catch (error) {
                if(isCreating) {
                    model.delete()
                }

                console.log('Error reading model ' + modelData.class)
                console.error(error)
                return
            }
        })
    }

    readRelationships(modelData: any, model: Model) {
        const relationshipsNames = model.getRelationshipsNames(),
            relationshipsKeyedByName = model.getAllRelationshipsKeyedByName()

        // Delete relationships that no longer exist
        relationshipsNames.forEach((relationshipName: string) => {
            if(!modelData.relationships.find(r => r.name === relationshipName)) {
                relationshipsKeyedByName[relationshipName].delete()
            }
        })

        // Create or update relationships
        modelData.relationships.forEach((relationshipData: any) => {
            let relationship: Relationship = null,
                isCreating = false

            try {
    
                if(!relationshipsNames.includes(relationshipData.name)) {
                    isCreating = true
                    relationship = new Relationship
                    relationship.modelId = model.id
    
                    relationshipsKeyedByName[relationshipData.name] = relationship
                } else {
                    relationship = relationshipsKeyedByName[relationshipData.name]
                    relationship.markAsNotRemoved()
                }
                
                relationship.projectId = this.project.id
    
                Relationship.savingInternally()
                relationship.applyChanges(relationshipData)
                relationship.fillRelationshipKeys()
                Relationship.notSavingInternally()
    
                this.changedRelationships.push(relationship)
            } catch (error) {
                if(isCreating) {
                    relationship.delete()
                }

                console.log(`Error reading relationship ${modelData.class}.${relationshipData.name}`)
                console.error(error)

                return
            }
        })
    }

    readInverseRelationships() {
        const modelsKeyedByClass = this.project.getAllModelsKeyedByClass()

        this.schemaModelsData.forEach((modelData: any) => {
            let model = modelsKeyedByClass[modelData.class]

            if(!model) return

            model.ownRelationships.forEach((relationship: Relationship) => {
                const relatedModelInstance = this.project.findModelByClass(relationship.relatedModelName),
                    inverseRelType = RelationshipTypes.getInverse(relationship.type)
    
                if(!relatedModelInstance || !inverseRelType) return
    
                const inverseRelationship = relatedModelInstance.findRelationship(inverseRelType, model.class)
    
                if(!(inverseRelationship instanceof Relationship)) return
                if(inverseRelationship.hasInverse()) return
    
                relationship.inverseId = inverseRelationship.id
                relationship.save()
            })
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