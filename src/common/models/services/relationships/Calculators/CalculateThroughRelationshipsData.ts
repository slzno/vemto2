import Relationship from "@Common/models/Relationship"
import CalculateRelationshipService from "../base/CalculateRelationshipService";
import WordManipulator from "@Common/util/WordManipulator";

class CalculateThroughRelationshipsData extends CalculateRelationshipService {
    relationship: Relationship

    setRelationship(relationship: Relationship): CalculateThroughRelationshipsData {
        this.relationship = relationship

        return this
    }

    hasValidRequiredData(): boolean {
        return !! this.relationship.firstKeyName
            && !! this.relationship.secondKeyName
            && this.relationship.through
            && this.relationship.through.isValid()
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

        const name = WordManipulator.camelCase(this.relationship.relatedModel.plural),
            nameCount = this.countRelationshipsWithSameName(name),
            hasSimilarNames = nameCount > 0

        this.relationship.name = hasSimilarNames ? `${name}${nameCount + 1}` : name
    }

    calculateFirstKeyName(): void {
        if(!this.relationship.relatedModel) return

        this.relationship.firstKeyName = this.getDefaultModelKeyName()
    }

    calculateSecondKeyName(): void {
        if(!this.relationship.through) return

        this.relationship.secondKeyName = this.getDefaultThroughModelKey()
    }

    getDefaultModelKeyName(): string {
        return WordManipulator.snakeCase(this.relationship.model.name) + '_id'
    }

    getDefaultThroughModelKey(): string {
        return WordManipulator.snakeCase(this.relationship.through.name) + '_id'
    }

    hasDifferentFirstKeyName(): boolean {
        return this.relationship.firstKeyName != this.getDefaultModelKeyName()
    }

    hasDifferentSecondKeyName(): boolean {
        return this.relationship.secondKeyName != this.getDefaultThroughModelKey()
    }

    needsToAddFirstKeyNameToModelTemplate(): boolean {
        return this.hasDifferentFirstKeyName() || this.hasDifferentSecondKeyName()
    }
}

export default new CalculateThroughRelationshipsData