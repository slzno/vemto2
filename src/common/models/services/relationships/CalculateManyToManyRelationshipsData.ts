import Table from "@Common/models/Table"
import Relationship from "@Common/models/Relationship"
import WordManipulator from "@Common/util/WordManipulator"
import RelationshipService from "./base/RelationshipService"

class CalculateManyToManyRelationshipsData extends RelationshipService {
    relationship: Relationship

    setRelationship(relationship: Relationship): CalculateManyToManyRelationshipsData {
        this.relationship = relationship

        return this
    }

    calculateDefaultData(): CalculateManyToManyRelationshipsData {
        this.calculateName()
        this.calculateForeignsKeysNames()
        this.calculatePivotName()

        return this
    }

    calculateForeignsKeysNames(): void {
        this.relationship.relatedPivotKeyName = this.getDefaultModelKeyName()
        this.relationship.foreignPivotKeyName = this.getDefaultLocalModelKeyName()
    }

    getDefaultModelKeyName(): string {
        return WordManipulator.snakeCase(this.relationship.relatedModel.name) + '_id'
    }

    getDefaultLocalModelKeyName(): string {
        return WordManipulator.snakeCase(this.relationship.model.name) + '_id'
    }

    calculatePivotName(): void {
        this.relationship.pivotTableName = this.getDefaultPivotName()
    }

    getDefaultPivotName(): string {
        if(!this.relationship.relatedModelId || !this.relationship.modelId) return

        const modelNames = [
                this.relationship.relatedModel.name,
                this.relationship.model.name
            ].sort(),
            firstModelNameSnakeCase = WordManipulator.snakeCase(modelNames[0]),
            secondModelNameSnakeCase = WordManipulator.snakeCase(modelNames[1])

        return `${firstModelNameSnakeCase}_${secondModelNameSnakeCase}`
    }

    processAndSave(createInverse = false): void {
        this.process(createInverse)   
        this.saveAndFinish()
    }

    saveAndFinish() {
        this.relationship.save()
        this.addToInverseRelation()
    }

    process(createInverse = false): void {
        this.createPivot()

        this.calculateKeys()
        this.calculateName()
        
        if(createInverse) this.createInverseRelationship()
    }

    createPivot(): void {
        if(this.relationship.pivotId) return

        let pivotName = this.getDefaultPivotName(),
            pivot = this.relationship.project.findTableByName(pivotName)

        if(!pivot) {
            pivot = new Table({
                projectId: this.relationship.projectId,
                name: pivotName,
            })
            
            pivot.save()
        }

        this.createPivotFields(pivot)

        this.relationship.pivotId = pivot.id
        this.relationship.save()
    }

    createPivotFields(pivot: Table): void {
        let relatedPivotKeyName = this.getRelatedPivotKeyName(),
            foreignPivotKeyName = this.getForeignPivotKeyName()
        
        pivot.addForeign(relatedPivotKeyName, this.relationship.relatedModel)
        pivot.addForeign(foreignPivotKeyName, this.relationship.model)
    }

    calculateKeys() {
        this.calculateParentKey()
        this.calculateRelatedKey()

        return this
    }

    calculateParentKey() {
        let keys = this.getDefaultKeys()

        this.relationship.parentKeyId = this.relationship.parentKeyId || keys.parentKey.id
    }

    calculateRelatedKey() {
        let keys = this.getDefaultKeys()

        this.relationship.relatedKeyId = this.relationship.relatedKeyId || keys.relatedKey.id
    }

    getDefaultKeys() {
        if(!this.relationship.pivotId) throw new Error('It is necessary to specify the pivot table before getting keys')

        let keys = {} as any

        keys.relatedKey = this.relationship.pivot.findColumnByName(this.getRelatedPivotKeyName())
        keys.parentKey = this.relationship.pivot.findColumnByName(this.getForeignPivotKeyName())
        
        return keys
    }

    getOriginalPivotName() {
        return this.relationship.pivotTableName || this.getDefaultPivotName()
    }

    getRelatedPivotKeyName(): string {
        return this.relationship.relatedPivotKeyName || this.getDefaultModelKeyName()
    }

    getForeignPivotKeyName(): string {
        return this.relationship.foreignPivotKeyName || this.getDefaultLocalModelKeyName()
    }

    createInverseRelationship(): boolean {
        if(this.relationship.inverseId) return false
        
        let inverseRelationship = new Relationship({
                modelId: this.relationship.relatedModel.id,
                relatedModelId: this.relationship.model.id,
                type: this.getInverseTypeKey(),
                pivotId: this.relationship.pivotId,
                parentKeyId: this.relationship.relatedKeyId,
                relatedKeyId: this.relationship.parentKeyId
            }),
            freeSimilarRelationship = this.relationship.relatedModel.getFreeSimilarRelationship(inverseRelationship)

        new CalculateManyToManyRelationshipsData()
            .setRelationship(inverseRelationship)
            .calculateDefaultData()
            .process()
        
        if(!freeSimilarRelationship) {
            inverseRelationship.save()
            this.relationship.inverseId = inverseRelationship.id
        } else {
            this.relationship.inverseId = freeSimilarRelationship.id
        }

        return true
    }
}

export default new CalculateManyToManyRelationshipsData