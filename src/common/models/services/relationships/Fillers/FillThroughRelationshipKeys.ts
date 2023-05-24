import Relationship from "@Common/models/Relationship"
import WordManipulator from '@Common/util/WordManipulator'

class FillThroughRelationshipKeys {
    relationship: Relationship

    setRelationship(relationship: Relationship): FillThroughRelationshipKeys {
        this.relationship = relationship

        return this
    }

    fillRelationship(relationship: Relationship): void {
        this.setRelationship(relationship).fill()
        this.relationship.save()
    }

    fill(): void {
        this.calculateRelatedModel()
        this.calculateThroughModel()
    }

    calculateRelatedModel(): void {
        if(this.relationship.relatedModelId) return

        const relatedModel = this.relationship.project.findModelByClass(this.relationship.relatedModelName)

        if(!relatedModel) return

        this.relationship.relatedModelId = relatedModel.id
        this.relationship.save()
    }

    calculateThroughModel(): void {
        if(this.relationship.throughId) return

        const throughModel = this.relationship.project.findModelByName(WordManipulator.runMultiple(
            ['singularize', 'pascalCase'],
            this.relationship.parentTableName
        ))

        if(!throughModel) return

        this.relationship.throughId = throughModel.id
        this.relationship.secondKeyName = this.relationship.secondKeyName || WordManipulator.snakeCase(throughModel.name) + '_id'
        this.relationship.save()

        return
    }
}

export default new FillThroughRelationshipKeys