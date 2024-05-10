import Relationship from "@Common/models/Relationship"

class FillCommonRelationshipKeys {
    relationship: Relationship

    setRelationship(relationship: Relationship): FillCommonRelationshipKeys {
        this.relationship = relationship

        return this
    }

    fillRelationship(relationship: Relationship): void {
        this.setRelationship(relationship).fill()
        this.relationship.save()
    }

    fill(): void {
        this.calculateRelatedModel()

        if(! this.relationship.relatedModelId) return
        
        this.relationship.getCalculatorService().calculateKeys()
    }

    calculateRelatedModel(): void {
        if(this.relationship.relatedModelId) return
        
        const relatedModel = this.relationship.project.findModelByClass(this.relationship.relatedModelName)

        if(! relatedModel) return

        this.relationship.relatedModelId = relatedModel.id
        this.relationship.save()
    }
}

export default new FillCommonRelationshipKeys