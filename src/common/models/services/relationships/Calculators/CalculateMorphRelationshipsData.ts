import Relationship from "@Common/models/Relationship"
import CalculateRelationshipService from "../base/CalculateRelationshipService"
import WordManipulator from "@Common/util/WordManipulator"
import Column from "@Common/models/Column"
import Table from "@Common/models/Table"

class CalculateMorphRelationshipsData extends CalculateRelationshipService {
    relationship: Relationship
    
    setRelationship(relationship: Relationship): CalculateMorphRelationshipsData {
        this.relationship = relationship

        return this
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

        this.relationship.pivotId = pivot.id
        this.relationship.save()

        this.createPivotData()
    }

    createPivotData(addMorphableFields: boolean = true): void {
        let modelKeyName = this.getDefaultModelKeyName(),
            pivot = this.relationship.pivot
        
        pivot.addForeign(modelKeyName, this.relationship.relatedModel)

        if(! addMorphableFields) return

        this.addMorphableFieldsToTable(
            pivot, 
            this.relationship.relatedModel.getPrimaryKeyColumn().getForeignType()
        )
    }

    getDefaultModelKeyName(): string {
        return WordManipulator.snakeCase(this.relationship.relatedModel.name) + '_id'
    }

    addMorphableFieldsToItself(): void {
        this.addMorphableFieldsToTable(
            this.relationship.relatedModel.table, 
            this.relationship.relatedModel.getPrimaryKeyColumn().getForeignType()
        )
    }

    addMorphableFieldsToTable(table: Table, idColumnType: string = 'unsignedBigInteger') {
        const mophableIdName = this.relationship.morphTo + '_id',
            morphableTypeName = this.relationship.morphTo + '_type'

        let idColumn = new Column({
                    tableId: table.id,
                    name: mophableIdName,
                    type: idColumnType,
                    index: true
                }),
            typeField = new Column({
                    tableId: table.id,
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