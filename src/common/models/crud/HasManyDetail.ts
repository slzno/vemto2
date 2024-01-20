import Crud, { CrudType } from './Crud'
import Relationship from '../Relationship'
import RelaDB from '@tiago_silva_pereira/reladb'
import { camelCase, capitalCase, paramCase } from 'change-case'

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
            crud.type,
            excludedColumns,
        )

        detailCrud.basePath = `${capitalCase(crud.name)}${capitalCase(detailCrud.plural)}Detail`
        detailCrud.isHasManyDetail = true
        detailCrud.save()

        hasManyDetail.detailCrudId = detailCrud.id

        hasManyDetail.save()
        
        return hasManyDetail
    }

    getLivewireBladeTag(): string {
        const sectionPath = this.crud.section.getFolderName(), 
            componentPath = `${sectionPath}.${paramCase(this.crud.name)}-${paramCase(this.detailCrud.plural)}-detail`

        return `<livewire:${componentPath} :${paramCase(this.crud.name)}="$${camelCase(this.crud.name)}" />`
    }
}