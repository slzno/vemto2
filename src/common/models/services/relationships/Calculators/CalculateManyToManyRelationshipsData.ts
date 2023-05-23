import Table from "@Common/models/Table"
import Relationship from "@Common/models/Relationship"
import WordManipulator from "@Common/util/WordManipulator"
import CalculateRelationshipService from "../base/CalculateRelationshipService"

class CalculateManyToManyRelationshipsData extends CalculateRelationshipService {
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
        this.relationship.relatedPivotKeyName = this.getDefaultRelatedPivotKeyName()
        this.relationship.foreignPivotKeyName = this.getDefaultForeignPivotKeyName()
    }

    getDefaultRelatedPivotKeyName(): string {
        return WordManipulator.snakeCase(this.relationship.relatedModel.name) + '_id'
    }

    getDefaultForeignPivotKeyName(): string {
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
        this.createOrUpdatePivot()

        this.calculateKeys()
        this.calculateName()
        
        if(createInverse) this.createInverseRelationship()
    }

    createOrUpdatePivot(forceUpdate: boolean = false): void {
        if(this.relationship.pivotId && !forceUpdate) return

        let pivotName = this.getDefaultPivotName(),
            pivot = this.relationship.project.findTableByName(pivotName)

        if(!pivot) {
            pivot = new Table({
                projectId: this.relationship.projectId,
                name: pivotName,
            })
            
            pivot.save()
        }

        this.createPivotData(pivot)

        this.relationship.pivotId = pivot.id
        this.relationship.save()
    }

    createPivotData(pivot: Table): void {
        let relatedPivotKeyName = this.getRelatedPivotKeyName(),
            foreignPivotKeyName = this.getForeignPivotKeyName()
        
        pivot.addForeign(relatedPivotKeyName, this.relationship.relatedModel)
        pivot.addForeign(foreignPivotKeyName, this.relationship.model)
    }

    calculateKeys() {
        this.calculateForeignPivotKey()
        this.calculateRelatedPivotKey()

        return this
    }

    calculateForeignPivotKey() {
        let keys = this.getDefaultKeys()

        this.relationship.foreignPivotKeyId = this.relationship.foreignPivotKeyId || keys.foreignPivotKey.id
    }

    calculateRelatedPivotKey() {
        let keys = this.getDefaultKeys()

        this.relationship.relatedPivotKeyId = this.relationship.relatedPivotKeyId || keys.relatedPivotKey.id
    }

    getDefaultKeys() {
        if(!this.relationship.pivotId) throw new Error('It is necessary to specify the pivot table before getting keys')

        let keys = {} as any

        keys.relatedPivotKey = this.relationship.pivot.findColumnByName(this.getRelatedPivotKeyName())
        keys.foreignPivotKey = this.relationship.pivot.findColumnByName(this.getForeignPivotKeyName())
        
        return keys
    }

    getOriginalPivotName() {
        return this.relationship.pivotTableName || this.getDefaultPivotName()
    }

    getRelatedPivotKeyName(): string {
        return this.relationship.relatedPivotKeyName || this.getDefaultRelatedPivotKeyName()
    }

    getForeignPivotKeyName(): string {
        return this.relationship.foreignPivotKeyName || this.getDefaultForeignPivotKeyName()
    }

    createInverseRelationship(): boolean {
        if(this.relationship.inverseId) return false
        
        let inverseRelationship = new Relationship({
                modelId: this.relationship.relatedModel.id,
                relatedModelId: this.relationship.model.id,
                type: this.getInverseTypeKey(),
                pivotId: this.relationship.pivotId,
                foreignPivotKeyId: this.relationship.relatedPivotKeyId,
                relatedPivotKeyId: this.relationship.foreignPivotKeyId
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

    needsToAddPivotToModelTemplate() {
        return this.hasDifferentPivot() 
            || this.hasDifferentRelatedPivot() 
            || this.hasDifferentForeignKey()
    }

    hasDifferentPivot(): boolean {
        return this.relationship.pivot.name !== this.getDefaultPivotName()
    }

    hasDifferentRelatedPivot(): boolean {
        return this.relationship.relatedPivotKey.name !== this.getRelatedPivotKeyName()
    }

    hasDifferentForeignKey(): boolean {
        return this.relationship.foreignPivotKey.name !== this.getForeignPivotKeyName()
    }

    hasDifferentForeignOrRelatedPivotKeys() {
        return this.hasDifferentForeignKey() || this.hasDifferentRelatedPivot()
    }
}

export default new CalculateManyToManyRelationshipsData