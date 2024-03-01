import Crud from './Crud'
import Relationship from '../Relationship'
import RelaDB from '@tiago_silva_pereira/reladb'
import { capitalCase } from 'change-case'
import { InputType } from './InputType'
import { FilamentInputType } from './filament/FilamentInputTypesList'

export default class BelongsToManyDetail extends RelaDB.Model {
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
        let belongsToManyDetail = new BelongsToManyDetail()
        belongsToManyDetail.crudId = crud.id
        belongsToManyDetail.relationshipId = relationship.id

        const excludedColumns = [
            relationship.foreignPivotKey,
        ]

        if(crud.isForFilament()) {
            excludedColumns.push(relationship.relatedPivotKey)
        }

        const detailCrud = Crud.createDetailFromTable(
            relationship.pivot,
            crud.type,
            excludedColumns
        )

        detailCrud.basePath = `${capitalCase(crud.name)}${capitalCase(detailCrud.plural)}Detail`
        detailCrud.isBelongsToManyDetail = true
        detailCrud.save()

        belongsToManyDetail.detailCrudId = detailCrud.id

        belongsToManyDetail.save()

        const input = detailCrud.inputs.find(input => input.name === relationship.relatedPivotKey.name)

        if (input) {
            input.filamentSettings.formData.canBeSearchable = true
            input.filamentSettings.formData.inputType = FilamentInputType.SELECT

            input.type = InputType.BELONGS_TO
            input.relationshipId = relationship.id
            input.save()
        }
        
        return belongsToManyDetail
    }
}