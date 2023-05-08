import Relationship from "@Common/models/Relationship"
import RelationshipService from "./base/RelationshipService";
import WordManipulator from "@Common/util/WordManipulator";
import Table from "@Common/models/Table";
import Model from "@Common/models/Model";

class CalculateManyToManyRelationshipsData extends RelationshipService {
    private _relationship: Relationship

    setRelationship(relationship: Relationship): CalculateManyToManyRelationshipsData {
        this._relationship = relationship

        return this
    }
    
    get relationship(): Relationship {
        return this._relationship
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
            pivot = this.relationship.project.findModelByName(pivotName)

        if(!pivot) {
            const table = new Table({
                projectId: this.relationship.projectId,
                name: pivotName,
            }).saveFromInterface()

            pivot = new Model({
                name: WordManipulator.pascalCase(pivotName),
                tableId: table.id,
                projectId: this.relationship.project.id,
                namespace: "App\\Models",
                hasGuarded: true,
                guarded: []
            }).saveFromInterface()
        }

        this.createPivotFields(pivot)

        this.relationship.pivotId = pivot.id
        this.relationship.saveFromInterface()
    }

    createPivotFields(pivot: Model): void {
        let modelKeyName = this.getOriginalModelKeyName(),
            localModelKeyName = this.getOriginalLocalModelKeyName()
        
        pivot.addForeign(modelKeyName, this.relationship.relatedModel)
        pivot.addForeign(localModelKeyName, this.relationship.model)
    }

    calculateKeys() {
        this.calculateLocalModelKey()
        this.calculateModelKey()

        return this
    }

    calculateLocalModelKey() {
        let keys = this.getDefaultKeys()

        this.relationship.parentKeyId = this.relationship.parentKeyId || keys.parentKey.id
    }

    calculateModelKey() {
        let keys = this.getDefaultKeys()

        this.relationship.relatedKeyId = this.relationship.relatedKeyId || keys.relatedKey.id
    }

    getDefaultKeys() {
        if(!this.relationship.pivotId) throw new Error('It is necessary to specify the pivot table before getting keys')

        let keys = {} as any

        keys.relatedKey = this.relationship.pivot.table.findColumnByName(this.getOriginalModelKeyName())
        keys.parentKey = this.relationship.pivot.table.findColumnByName(this.getOriginalLocalModelKeyName())
        
        return keys
    }

    getOriginalPivotName() {
        return this.relationship.pivotTableName || this.getDefaultPivotName()
    }

    getOriginalModelKeyName(): string {
        return this.relationship.relatedPivotKeyName || this.getDefaultModelKeyName()
    }

    getOriginalLocalModelKeyName(): string {
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

        this.setRelationship(inverseRelationship)
            .calculateDefaultData()
            .process()
            
        this.setRelationship(this.relationship)
        
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