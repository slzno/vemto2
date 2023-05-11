import Foreign from "@Common/models/Foreign"
import Relationship from "@Common/models/Relationship"
import WordManipulator from '@Common/util/WordManipulator'
import RelationshipService from './base/RelationshipService'
import Index from "@Common/models/Index"

class CalculateCommonRelationshipsData extends RelationshipService {
    private _relationship: Relationship

    setRelationship(relationship: Relationship): CalculateCommonRelationshipsData {
        this._relationship = relationship

        return this
    }

    get relationship(): Relationship {
        return this._relationship
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
        this.relationship.saveFromInterface()
        this.addToInverseRelation()
    }

    createInverseRelationship() {
        if(this.relationship.inverseId) return
        
        const inverseRelationship = new Relationship({
                modelId: this.relationship.relatedModelId,
                projectId: this.relationship.projectId,
                relatedModelId: this.relationship.modelId,
                type: this.getInverseTypeKey(),
                foreignKeyName: this.relationship.foreignKeyName
            })

        this.setRelationship(inverseRelationship).process()
        this.setRelationship(this.relationship)

        const freeSimilarRelationship = this.relationship.relatedModel.getFreeSimilarRelationship(inverseRelationship)
        
        if(!freeSimilarRelationship) {
            inverseRelationship.save()
            this.relationship.inverseId = inverseRelationship.id
        } else {
            this.relationship.inverseId = freeSimilarRelationship.id
        }

        return true
    }

    addForeign(): Index {
        if(!(['BelongsTo'].includes(this.relationship.type))) return

        let foreignName = this.getOriginalForeignName()

        return this.relationship.model.table.addForeign(
            foreignName,
            this.relationship.relatedModel
        )
    }

    calculateKeys() {
        this.calculateParentKey()
        this.calculateForeignKey()

        return this
    }

    calculateForeignKey() {
        let keys = this.getDefaultKeys()

        this.relationship.foreignKeyId = this.relationship.foreignKeyId || keys.foreignKey.id
    }

    calculateDefaultData(): void {
        this.calculateName()
        this.calculateParentKey()
        this.calculateForeignName()
    }

    calculateParentKey() {
        this.checkTypeAndRelatedModel()
        
        let keys = this.getDefaultKeys()

        this.relationship.parentKeyId = this.relationship.parentKeyId || keys.parentKey.id
    }

    calculateForeignName() {
        this.relationship.foreignKeyName = this.getDefaultForeignKeyName()
    }

    getDefaultKeys() {
        let keys = {} as any,
            foreignName = this.getOriginalForeignName()

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

    getOriginalForeignName() {
        return this.relationship.foreignKeyName || this.getDefaultForeignKeyName()
    }

    getDefaultForeignKeyName() {
        return WordManipulator.snakeCase(this.relationship.getParentModel().name) + '_id'
    }
}

export default new CalculateCommonRelationshipsData