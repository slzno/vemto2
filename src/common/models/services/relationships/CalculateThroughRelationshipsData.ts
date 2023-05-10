import Relationship from "@Common/models/Relationship"
import RelationshipService from "./base/RelationshipService";
import WordManipulator from "@Common/util/WordManipulator";

class CalculateThroughRelationshipsData extends RelationshipService {
    private _relationship: Relationship

    setRelationship(relationship: Relationship): CalculateThroughRelationshipsData {
        this._relationship = relationship

        return this
    }

    get relationship(): Relationship {
        return this._relationship
    }

    calculateDefaultData(): void {
        this.calculateName()
        this.calculateRelatedKey()
        this.calculateThroughKey()
    }

    processAndSave(): void {
        this.relationship.save()
    }

    calculateName(): string {
        if(!this.relationship.through) return

        this.relationship.name = WordManipulator.camelCase(this.relationship.relatedModel.plural)
    }

    calculateRelatedKey(): void {
        if(!this.relationship.model) return

        this.relationship.relatedKeyName = this.getDefaultRelatedModelKey()
    }

    calculateThroughKey(): void {
        if(!this.relationship.through) return

        this.relationship.throughKeyName = this.getDefaultThroughModelKey()
    }

    getDefaultRelatedModelKey(): string {
        return WordManipulator.snakeCase(this.relationship.relatedModel.name) + '_id'
    }

    getDefaultThroughModelKey(): string {
        return WordManipulator.snakeCase(this.relationship.through.name) + '_id'
    }
}

export default new CalculateThroughRelationshipsData