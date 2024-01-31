import Crud from './Crud'
import Relationship from '../Relationship'
import RelaDB from '@tiago_silva_pereira/reladb'
import { capitalCase } from 'change-case'

export default class MorphManyDetail extends RelaDB.Model {
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
        let morphManyDetail = new MorphManyDetail()
        morphManyDetail.crudId = crud.id
        morphManyDetail.relationshipId = relationship.id

        const excludedColumns = [
            relationship.idColumn,
            relationship.typeColumn
        ]

        const detailCrud = Crud.createFromModel(
            relationship.relatedModel,
            crud.type,
            excludedColumns,
        )

        detailCrud.basePath = `${capitalCase(crud.name)}${capitalCase(detailCrud.plural)}Detail`
        detailCrud.isMorphManyDetail = true
        detailCrud.save()

        morphManyDetail.detailCrudId = detailCrud.id

        morphManyDetail.save()
        
        return morphManyDetail
    }
}