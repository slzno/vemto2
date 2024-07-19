import Crud, { CrudType } from './Crud'
import Relationship from '../Relationship'
import RelaDB from '@tiago_silva_pereira/reladb'
import { camelCase, capitalCase, paramCase } from 'change-case'
import Route from '../Route'
import GenerateCrudApiRoutes from './services/GenerateCrudApiRoutes'
import AppSection from '../AppSection'

export default class HasManyDetail extends RelaDB.Model {
    id: string
    crud: Crud
    crudId: string
    detailCrud: Crud
    detailCrudId: string
    relationship: Relationship
    relationshipId: string
    routes: Route[]
    section: AppSection
    sectionId: string

    relationships() {
        return {
            routes: () => this.morphMany(Route, 'routable').cascadeDelete(),
            section: () => this.belongsTo(AppSection, "sectionId"),

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

        const excludedColumns = crud.isApi() ? [] : [
            relationship.foreignKey,
        ]

        const detailCrud = Crud.createDetailFromModel(
            relationship.relatedModel,
            crud.type,
            excludedColumns
        )

        detailCrud.basePath = `${capitalCase(crud.name)}${capitalCase(detailCrud.plural)}Detail`
        detailCrud.isHasManyDetail = true
        detailCrud.save()

        hasManyDetail.sectionId = crud.sectionId
        hasManyDetail.detailCrudId = detailCrud.id

        hasManyDetail.save()

        if(crud.isApi()) {
            new GenerateCrudApiRoutes(crud).generateHasManyRelationshipRoutes(hasManyDetail)
        }
        
        return hasManyDetail
    }

    getLivewireBladeTag(): string {
        const sectionPath = this.crud.section.getFolderName(), 
            componentPath = `${sectionPath}.${paramCase(this.crud.name)}-${paramCase(this.detailCrud.plural)}-detail`

        return `<livewire:${componentPath} :${paramCase(this.crud.name)}="$${camelCase(this.crud.name)}" />`
    }

    getRouteContent(): string {
        return ''
    }

    getApiControllerName(): string {
        return `${this.relationship.model.plural}${this.relationship.relatedModel.name}Controller`
    }
    
    isInvalid(): boolean {
        return ! this.isValid()
    }

    isValid(): boolean {
        return ! this.hasInvalidItemOrCollectionName()
    }

    hasInvalidItemOrCollectionName(): boolean {
        return this.detailCrud.settings.itemName === this.crud.settings.itemName || this.detailCrud.settings.collectionName === this.crud.settings.collectionName
    }
}