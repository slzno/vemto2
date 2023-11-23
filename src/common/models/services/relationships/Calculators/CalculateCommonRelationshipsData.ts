import Relationship from "@Common/models/Relationship"
import WordManipulator from '@Common/util/WordManipulator'
import CalculateRelationshipService from '../base/CalculateRelationshipService'
import Index from "@Common/models/Index"
import Model from "@Common/models/Model"

class CalculateCommonRelationshipsData extends CalculateRelationshipService {
    relationship: Relationship

    setRelationship(relationship: Relationship): CalculateCommonRelationshipsData {
        this.relationship = relationship

        return this
    }

    processAndSave(createInverse: boolean = false): void {
        this.process(createInverse)
        this.saveAndFinish()
    }

    process(createInverse: boolean = false): void {
        if(this.relationship.type !== 'BelongsTo' && createInverse) {
            this.createInverseRelationship()
        }

        this.addForeign()

        if(this.relationship.type === 'BelongsTo' && createInverse) {
            this.createInverseRelationship()
        }

        this.calculateKeys()
        this.calculateName()
    }

    saveAndFinish() {
        this.relationship.save()
        this.addToInverseRelation()
    }

    createInverseRelationship() {
        if(this.relationship.inverseId) return
        
        const inverseRelationship = new Relationship({
                name: this.calculateInverseName(),
                modelId: this.relationship.relatedModelId,
                projectId: this.relationship.projectId,
                relatedModelId: this.relationship.modelId,
                type: this.getInverseTypeKey(),
                foreignKeyName: this.relationship.foreignKeyName
            })

        new CalculateCommonRelationshipsData()
            .setRelationship(inverseRelationship)
            .process()

        const freeSimilarRelationship = this.relationship.relatedModel.getFreeSimilarRelationship(inverseRelationship)
        
        if(!freeSimilarRelationship) {
            inverseRelationship.save()
            this.relationship.inverseId = inverseRelationship.id
        } else {
            this.relationship.inverseId = freeSimilarRelationship.id
        }

        return true
    }

    calculateInverseName(): string {
        const nameIsPlural = WordManipulator.isPlural(this.relationship.name)

        if(nameIsPlural) {
            return WordManipulator.singularize(this.relationship.name)
        }

        return WordManipulator.pluralize(this.relationship.name)
    }

    addForeign(): Index {
        if(!(['BelongsTo'].includes(this.relationship.type))) return

        return this.relationship.model.table.addForeign(
            this.getForeignKeyName(),
            this.relationship.relatedModel
        )
    }

    calculateKeys() {
        this.calculateParentKey()
        this.calculateForeignKey()

        return this
    }

    calculateForeignKey() {
        if(this.relationship.foreignKeyId) return

        let keys = this.getDefaultKeys()

        if(!keys.foreignKey) {
            throw new Error(`The foreign key ${this.getForeignKeyName()} does not exist in the ${this.relationship.model.name} model`)
        }

        this.relationship.foreignKeyId = keys.foreignKey.id
    }

    calculateDefaultData(): void {
        this.calculateName()
        this.calculateParentKey()
        this.calculateForeignKeyName()
    }

    calculateParentKey(): void {
        if(this.relationship.parentKeyId) return

        this.checkTypeAndRelatedModel()
        
        const keys = this.getDefaultKeys()

        if(!keys.parentKey) {
            throw new Error(`The parent key ${this.getPrimaryKeyName()} does not exist in the ${this.relationship.relatedModel.name} model`)
        }

        this.relationship.parentKeyId = keys.parentKey.id
    }

    calculateForeignKeyName() {
        this.relationship.foreignKeyName = this.getDefaultForeignKeyName()
    }

    getDefaultKeys() {
        const keys = {} as any,
            foreignName = this.getForeignKeyName()

        if(['BelongsTo'].includes(this.relationship.type)) {
            keys.parentKey = this.relationship.relatedModel.getPrimaryKeyColumn()
            keys.foreignKey = this.relationship.model.getColumnByName(foreignName)
        }
        
        if(['HasMany', 'HasOne'].includes(this.relationship.type)) {
            keys.parentKey = this.relationship.model.getPrimaryKeyColumn()
            keys.foreignKey = this.relationship.relatedModel.getColumnByName(foreignName)
        }

        return keys
    }

    getPrimaryKeyName(): string {
        const primaryKey = this.relationship.model.getPrimaryKeyColumn()

        return primaryKey ? primaryKey.name : 'id'
    }

    getForeignKeyName(): string {
        return this.relationship.foreignKeyName || this.getDefaultForeignKeyName()
    }

    getDefaultForeignKeyName(): string {
        return WordManipulator.snakeCase(this.relationship.getParentModel().name) + '_id'
    }

    hasDifferentParentKey(): boolean {
        return this.relationship.parentKey.name !== 'id'
    }

    hasDifferentForeignKey(): boolean {
        return this.relationship.foreignKey.name !== this.getDefaultForeignKeyName()
    }

    hasDifferentForeignOrParentKey(): boolean {
        return this.hasDifferentForeignKey()
            || this.hasDifferentParentKey()
            || ! this.nameFollowsDefaultRule()
    }

    getForeignModel(): Model {
        if(['BelongsTo'].includes(this.relationship.type)) {
            return this.relationship.model
        }
        
        if(['HasMany', 'HasOne'].includes(this.relationship.type)) {
            return this.relationship.relatedModel
        }
    }
}

export default new CalculateCommonRelationshipsData