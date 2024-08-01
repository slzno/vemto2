import Crud from './Crud'
import Relationship from '../Relationship'
import RelaDB from '@tiago_silva_pereira/reladb'
import { capitalCase } from 'change-case'
import { InputType } from './InputType'
import { FilamentInputType } from './filament/FilamentInputTypesList'
import Route from '../Route'
import GenerateCrudApiRoutes from './services/GenerateCrudApiRoutes'
import FilamentInputData from './filament/FilamentInputData'
import FilamentInputSettings from './filament/FilamentInputSettings'
import AppSection from '../AppSection'
import { NovaInputType } from './nova/NovaInputTypesList'

export default class BelongsToManyDetail extends RelaDB.Model {
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

    static deleting(detail: BelongsToManyDetail) {
        detail.detailCrud.delete()
    }

    static createFromRelation(crud: Crud, relationship: Relationship) {
        let belongsToManyDetail = new BelongsToManyDetail()
        belongsToManyDetail.crudId = crud.id
        belongsToManyDetail.relationshipId = relationship.id

        const excludedColumns = crud.isApi() ? [] : [
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

        if(crud.isForNova()) {
            detailCrud.novaSettings.displayInNavigation = false
            detailCrud.novaSettings.clickAction = 'ignore'
        }

        detailCrud.basePath = `${capitalCase(crud.name)}${capitalCase(detailCrud.plural)}Detail`
        detailCrud.isBelongsToManyDetail = true
        detailCrud.save()

        belongsToManyDetail.sectionId = crud.sectionId
        belongsToManyDetail.detailCrudId = detailCrud.id

        belongsToManyDetail.save()

        const input = detailCrud.inputs.find(input => input.name === relationship.relatedPivotKey.name)

        if (!crud.isApi() && input) {
            input.type = InputType.BELONGS_TO
            input.relationshipId = relationship.id

            if(crud.isForFilament()) {
                input.filamentSettings.formData.canBeSearchable = true
                input.filamentSettings.formData.inputType = FilamentInputType.SELECT
            }

            if(crud.isForNova()) {
                input.type = InputType.TEXT
                input.novaSettings.inputType = NovaInputType.TEXT
                input.showOnCreation = false
                input.showOnUpdate = false
                input.showOnDetails = false
                input.showOnIndex = true
            }
            
            input.save()
        }

        if(crud.isApi()) {
            new GenerateCrudApiRoutes(crud).generateBelongsToManyRelationshipRoutes(belongsToManyDetail)
        }
        
        return belongsToManyDetail
    }

    getRouteContent(): string {
        return ''
    }

    getApiControllerName(): string {
        return `${this.relationship.model.plural}${this.relationship.relatedModel.name}Controller`
    }
}