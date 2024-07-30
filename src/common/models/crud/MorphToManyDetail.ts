import Crud from './Crud'
import Relationship from '../Relationship'
import RelaDB from '@tiago_silva_pereira/reladb'
import { capitalCase } from 'change-case'
import { InputType } from './InputType'
import { FilamentInputType } from './filament/FilamentInputTypesList'
import { NovaInputType } from './nova/NovaInputTypesList'

export default class MorphToManyDetail extends RelaDB.Model {
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

    static deleting(detail: MorphToManyDetail) {
        detail.detailCrud.delete()
    }

    static createFromRelation(crud: Crud, relationship: Relationship) {
        let morphToManyDetail = new MorphToManyDetail()
        morphToManyDetail.crudId = crud.id
        morphToManyDetail.relationshipId = relationship.id

        const excludedColumns = [
            relationship.idColumn,
            relationship.typeColumn,
        ]

        const detailCrud = Crud.createDetailFromTable(
            relationship.pivot,
            crud.type,
            excludedColumns
        )

        if(crud.isForNova()) {
            detailCrud.novaSettings.displayInNavigation = false
        }

        detailCrud.basePath = `${capitalCase(crud.name)}${capitalCase(detailCrud.plural)}Detail`
        detailCrud.isMorphToManyDetail = true
        detailCrud.save()

        morphToManyDetail.detailCrudId = detailCrud.id

        morphToManyDetail.save()

        const input = detailCrud.inputs.find(input => input.name === relationship.relatedPivotKeyName)

        if(input && crud.isForFilament()) {
            // Filament generates a new input for the pivot table automatically
            input.delete()
        }

        if(!input) {
            return morphToManyDetail
        }

        input.type = crud.isForNova() ? InputType.TEXT : InputType.BELONGS_TO
        input.relationshipId = crud.isForNova() ? null : relationship.id
        input.novaSettings.inputType = NovaInputType.TEXT
        input.showOnCreation = false
        input.showOnUpdate = false
        input.showOnDetails = false
        input.showOnIndex = true
        
        input.save()
        
        return morphToManyDetail
    }
}