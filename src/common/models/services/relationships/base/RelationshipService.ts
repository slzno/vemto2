import Relationship from "@Common/models/Relationship"
import WordManipulator from '@Common/util/WordManipulator'
import RelationshipTypes from '@Common/models/static/RelationshipTypes'

export default abstract class RelationshipService {
    abstract get relationship(): Relationship

    calculateName(): string {
        const finalName = this.getFinalDefaultName()

        this.relationship.defaultName = finalName
        this.relationship.usingFirstDefaultName = finalName === this.getDefaultName()

        if(this.relationship.name) return

        this.relationship.name = finalName

        return finalName
    }

    getFinalDefaultName(): string {
        const name = this.getDefaultName(),
            nameCount = this.countRelationshipsWithSameName(name),
            hasSimilarNames = nameCount > 0

        return hasSimilarNames ? `${name}${nameCount + 1}` : name
    }

    countRelationshipsWithSameName(name: string) {
        const allRelationships = this.relationship.model.ownRelationships,
            nameRegex = new RegExp(`(${name})([0-9])*`)

        const count = allRelationships
            .filter(rel => nameRegex.test(rel.name))
            .length

        return count
    }

    getDefaultName(): string {
        if(this.relationship.isSingular()) {
            return WordManipulator.camelCase(this.relationship.relatedModel.name)
        }
        
        if(this.relationship.isCollection()) {
            return WordManipulator.camelCase(this.relationship.relatedModel.plural)
        }

        return ''
    }

    checkTypeAndRelatedModel() {
        if(!this.relationship.hasTypeAndRelatedModel()) { 
            throw new Error('Please specify a valid type and related model')
        }
    }

    getInverseTypeKey(): string {
        return RelationshipTypes.getInverse(this.relationship.type)
    }

    addToInverseRelation(): void {
        let inverse = this.relationship.inverse.fresh()
        
        if(!inverse.inverseId) {
            inverse.inverseId = this.relationship.id
            inverse.save()
        }
    }
}