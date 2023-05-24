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

        if(! this.relationship.relatedModelId) return

        if(this.relationship.type === 'MorphToMany') {
            this.calculatePivotTable()
            this.relationship.getServiceFromType().createPivotData(false)
        }

        this.relationship.getServiceFromType().calculateMorphTo()
    }

    calculatePivotTable(): void {
        if(this.relationship.pivotId) return
        
        const pivotTable = this.relationship.project.findTableByName(this.relationship.pivotTableName)
        
        if(!pivotTable) return
        
        this.relationship.pivotId = pivotTable.id
        this.relationship.save()
    }

    calculateRelatedModel(): void {
        if(this.relationship.relatedModelId) return
        
        const relatedModel = this.relationship.project.findModelByClass(this.relationship.relatedModelName)
        
        if(!relatedModel) return

        this.relationship.relatedModelId = relatedModel.id
        this.relationship.save()
    }
}

export default new FillMorphRelationshipKeys