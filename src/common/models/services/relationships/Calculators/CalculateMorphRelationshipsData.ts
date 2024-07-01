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

    hasValidRequiredData(): boolean {
        return !! this.relationship.idColumn
            && !! this.relationship.typeColumn
            && this.relationship.idColumn.isValid()
            && this.relationship.typeColumn.isValid()
    }

    calculateDefaultData(): void {
        this.calculateName()
        this.calculateMorphTo()
    }

    calculateMorphTo(): void {
        if(this.relationship.morphToName) return

        this.relationship.morphToName = this.getCorrectAbleSuffix()
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
        if(this.relationship.pivotId) {
            const pivot = this.relationship.pivot

            this.addMorphableFieldsToTableIfNecessary(pivot)

            return
        }

        const pivotName = WordManipulator.pluralize(this.relationship.morphToName)
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

        this.addMorphableFieldsToTableIfNecessary(
            pivot, 
            this.relationship.relatedModel.getPrimaryKeyColumn().getForeignType()
        )
    }

    getDefaultModelKeyName(): string {
        return WordManipulator.snakeCase(this.relationship.relatedModel.name) + '_id'
    }

    addMorphableFieldsToItself(): void {
        this.addMorphableFieldsToTableIfNecessary(
            this.relationship.relatedModel.table, 
            this.relationship.relatedModel.getPrimaryKeyColumn().getForeignType()
        )
    }

    addMorphableFieldsToTableIfNecessary(table: Table, idColumnType: string = 'unsignedBigInteger'): void {
        const morphableIdName = this.relationship.morphToName + '_id',
            morphableTypeName = this.relationship.morphToName + '_type'

        let idColumn = table.getColumnByName(morphableIdName)
        let typeColumn = table.getColumnByName(morphableTypeName)

        if(!idColumn) {
            idColumn = new Column({
                tableId: table.id,
                name: morphableIdName,
                type: idColumnType,
                index: true
            })
        }
        
        if(!typeColumn) {
            typeColumn = new Column({
                tableId: table.id,
                name: morphableTypeName,
                type: 'string',
                index: true
            })
        }

        idColumn.save()
        typeColumn.save()

        this.relationship.idColumnId = idColumn.id
        this.relationship.typeColumnId = typeColumn.id

        this.relationship.save()
    }
}

export default new CalculateMorphRelationshipsData