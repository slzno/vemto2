import Relationship from "@Common/models/Relationship"

class FillMorphRelationshipKeys {
    relationship: Relationship

    setRelationship(relationship: Relationship): FillMorphRelationshipKeys {
        this.relationship = relationship

        return this
    }

    fillRelationship(relationship: Relationship): void {
        this.setRelationship(relationship).fill()
        this.relationship.save()
    }

    fill(): void {
        this.relationship.getServiceFromType().calculateMorphTo()
    }
}

export default new FillMorphRelationshipKeys