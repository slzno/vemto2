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
        this.calculateRelatedModel()

        if(this.relationship.type === 'MorphToMany') {
            this.calculatePivotTable()
            this.relationship.getServiceFromType().createPivotData(false)
        }

        if(! this.relationship.relatedModelId) return

        this.relationship.getServiceFromType().calculateMorphTo()
    }

    calculatePivotTable(): void {
        if(this.relationship.pivotId) return
        
        const pivotTable = this.relationship.project.findTableByName(this.relationship.pivotTableName)
        
        if(!pivotTable) return
        
        this.relationship.pivotId = pivotTable.id
    }

    calculateRelatedModel(): void {
        if(this.relationship.relatedModelId) return
        
        const relatedModel = this.relationship.project.findModelByClass(this.relationship.relatedModelName)
        
        if(!relatedModel) return

        this.relationship.relatedModelId = relatedModel.id
    }
}

export default new FillMorphRelationshipKeys