import Relationship from "@Common/models/Relationship"
import RelationshipService from "./base/RelationshipService"
import WordManipulator from "@Common/util/WordManipulator"
import Column from "@Common/models/Column"
import Model from "@Common/models/Model"
import Table from "@Common/models/Table"

class CalculateMorphRelationshipsData extends RelationshipService {
    private _relationship: Relationship
    
    setRelationship(relationship: Relationship): CalculateMorphRelationshipsData {
        this._relationship = relationship

        return this
    }

    get relationship(): Relationship {
        return this._relationship
    }

    calculateDefaultData(): void {
        this.calculateName()
        this.calculateMorphTo()
    }

    calculateMorphTo(): void {
        if(this.relationship.morphTo) return

        this.relationship.morphTo = this.getCorrectAbleSuffix()
    }

    getCorrectAbleSuffix(): string {
        const baseName = WordManipulator.snakeCase(this.relationship.relatedModel.name),
            exceptions = {
                'tag': 'taggable',
                'favorite': 'favoritable',
            }

        if(exceptions[baseName]) {
            return exceptions[baseName]
        }

        return baseName + 'able'
    }

    processAndSave(): void {
        this.process()
        
        this.relationship.save()
    }

    process(): void {
        this.calculateDefaultData()

        if(this.relationship.isCommonMorph()) {
            this.addMorphableFieldsToItself()
        } else {
            this.addPivotTable()
        }
    }

    addPivotTable(): void {
        if(this.relationship.pivotId) return

        const pivotName = WordManipulator.pluralize(this.relationship.morphTo)
        
        let pivot = this.relationship.project.findTableByName(pivotName)

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
        let modelKeyName = this.getDefaultModelKeyName()
        
        pivot.addForeign(modelKeyName, this.relationship.relatedModel)

        this.addMorphableFieldsToPivot(
            pivot, 
            this.relationship.relatedModel.getPrimaryKey().getForeignType()
        )
    }

    getDefaultModelKeyName(): string {
        return WordManipulator.snakeCase(this.relationship.relatedModel.name) + '_id'
    }

    addMorphableFieldsToItself(): void {
        this.addMorphableFieldsToPivot(
            this.relationship.pivot, 
            this.relationship.relatedModel.getPrimaryKey().getForeignType()
        )
    }

    addMorphableFieldsToPivot(pivot: Table, idColumnType: string = 'unsignedBigInteger') {
        const mophableIdName = this.relationship.morphTo + '_id',
            morphableTypeName = this.relationship.morphTo + '_type'

        let idColumn = new Column({
                    tableId: pivot.id,
                    name: mophableIdName,
                    type: idColumnType,
                    index: true
                }),
            typeField = new Column({
                    tableId: pivot.id,
                    name: morphableTypeName,
                    type: 'string',
                    index: true
                })

        idColumn.save()
        typeField.save()

        this.relationship.idColumnId = idColumn.id
        this.relationship.typeFieldId = typeField.id

        this.relationship.save()
    }
}

export default new CalculateMorphRelationshipsData