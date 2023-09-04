import Crud from './Crud'
import Relationship from '../Relationship'
import RelaDB from '@tiago_silva_pereira/reladb'

export default class HasManyDetail extends RelaDB.Model {
    id: string
    crud: Crud
    crudId: string
    detailCrud: Crud
    detailCrudId: string
    relationship: Relationship
    relationshipId: string

    relationships() {
        return {
            crud: () => this.belongsTo(Crud),
            detailCrud: () => this.belongsTo(Crud, "detailCrudId"),
            relationship: () => this.belongsTo(Relationship),
        }
    }

    deleting() {
        this.detailCrud.delete()
    }

    static createFromRelation(crud: Crud, relationship: Relationship) {
        let hasManyDetail = new HasManyDetail()
        hasManyDetail.crudId = crud.id
        hasManyDetail.relationshipId = relationship.id

        const excludedColumns = [
            relationship.foreignKey,
        ]

        const detailCrud = Crud.createFromModel(
            relationship.relatedModel,
            excludedColumns,
        )

        detailCrud.isHasManyDetail = true
        detailCrud.save()

        hasManyDetail.detailCrudId = detailCrud.id

        hasManyDetail.save()
        
        return hasManyDetail
    }
}