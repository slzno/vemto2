import Relationship from "@Common/models/Relationship"
import RelationshipService from "./base/RelationshipService";
import WordManipulator from "@Common/util/WordManipulator";

class CalculateThroughRelationshipsData extends RelationshipService {
    relationship: Relationship

    setRelationship(relationship: Relationship): CalculateThroughRelationshipsData {
        this.relationship = relationship

        return this
    }

    calculateDefaultData(): void {
        this.calculateName()
        this.calculateFirstKeyName()
        this.calculateSecondKeyName()
    }

    processAndSave(): void {
        this.relationship.save()
    }

    calculateName(): string {
        if(!this.relationship.through) return

        this.relationship.name = WordManipulator.camelCase(this.relationship.relatedModel.plural)
    }

    calculateFirstKeyName(): void {
        if(!this.relationship.model) return

        this.relationship.firstKeyName = this.getDefaultRelatedModelKey()
    }

    calculateSecondKeyName(): void {
        if(!this.relationship.through) return

        this.relationship.secondKeyName = this.getDefaultThroughModelKey()
    }

    getDefaultRelatedModelKey(): string {
        return WordManipulator.snakeCase(this.relationship.relatedModel.name) + '_id'
    }

    getDefaultThroughModelKey(): string {
        return WordManipulator.snakeCase(this.relationship.through.name) + '_id'
    }
}

export default new CalculateThroughRelationshipsData