import Input from "./Input"
import CrudPanel from "./CrudPanel"
import Model from "@Common/models/Model"
import Route, { RouteType } from "@Common/models/Route"
import { camelCase, capitalCase, paramCase } from "change-case"
import Column from "@Common/models/Column"
import Project from "@Common/models/Project"
import RelaDB from "@tiago_silva_pereira/reladb"

export enum CrudType {
    DEFAULT = "Default",
    VUE = "Vue",
    LIVEWIRE = "Livewire",
}

export interface CrudSettings {
    itemTitle: string
    collectionTitle: string
}

export default class Crud extends RelaDB.Model {
    id: string
    name: string
    plural: string
    namespace: string
    type: CrudType
    model: Model
    modelId: string
    project: Project
    projectId: string
    panels: CrudPanel[]
    inputs: Input[]
    settings: CrudSettings
    defaultSearchColumn: Column
    defaultSearchColumnId: string
    defaultSortColumn: Column
    defaultSortColumnId: string
    defaultSortDirection: string
    routes: Route[]

    // Livewire specific
    livewireIndexComponentName: string
    livewireShowComponentName: string
    livewireCreateComponentName: string
    livewireEditComponentName: string

    relationships() {
        return {
            model: () => this.belongsTo(Model),
            project: () => this.belongsTo(Project),
            inputs: () => this.hasMany(Input).cascadeDelete(),
            panels: () => this.hasMany(CrudPanel).cascadeDelete(),
            routes: () => this.morphMany(Route, "routable").cascadeDelete(),
            defaultSearchColumn: () => this.belongsTo(Column, "defaultSearchColumnId"),
            defaultSortColumn: () => this.belongsTo(Column, "defaultSortColumnId"),
        }
    }

    hasDefaultSearchColumn(): boolean {
        return !! this.defaultSearchColumn
    }

    hasDefaultSortColumn(): boolean {
        return !! this.defaultSortColumn
    }

    static createFromModel(model: Model) {
        const defaultSearchColumn = model.table.getLabelColumn()

        const defaultSortColumn = model.table.getUpdatedAtColumn() 
            || model.table.getCreatedAtColumn()
            || model.table.getPrimaryKeyColumn()
            || defaultSearchColumn

        const crud = new Crud()
        crud.type = CrudType.LIVEWIRE
        crud.name = capitalCase(model.name)
        crud.plural = capitalCase(model.plural)
        crud.namespace = crud.calculateNamespace()
        crud.modelId = model.id
        crud.projectId = model.projectId

        crud.calculateLiveWireSpecificData()

        if(defaultSearchColumn) crud.defaultSearchColumnId = defaultSearchColumn.id
        if(defaultSortColumn) crud.defaultSortColumnId = defaultSortColumn.id

        crud.defaultSortDirection = "asc"

        crud.save()

        crud.addInputsFromModel(model)
        crud.addRoutes()
    }

    calculateNamespace(): string {
        return `App\\Http\\Livewire`
    }

    calculateLiveWireSpecificData() {
        this.livewireIndexComponentName = `${this.name}Index`
        this.livewireShowComponentName = `${this.name}Show`
        this.livewireCreateComponentName = `${this.name}Create`
        this.livewireEditComponentName = `${this.name}Edit`
    }

    addInputsFromModel(model: Model) {
        const panel = new CrudPanel()
        panel.title = 'Main'
        panel.crudId = this.id
        panel.order = 0
        panel.save()

        model.table.getColumns().forEach((column) => {
            if(column.isPrimaryKey()) return
            if(column.isDefaultLaravelTimestamp()) return

            const input = Input.createFromColumn(column)
            input.crudId = this.id
            input.panelId = panel.id
            input.save()
        })
    }

    addRoutes() {
        Route.create({
            name: `${paramCase(this.plural)}.index`,
            method: "get",
            type: RouteType.ROUTE,
            path: `/${paramCase(this.plural)}`,
            routableId: this.id,
            routableType: "Crud",
            projectId: this.projectId,
        })

        Route.create({
            name: `${paramCase(this.plural)}.create`,
            method: "get",
            type: RouteType.ROUTE,
            path: `/${paramCase(this.plural)}/create`,
            routableId: this.id,
            routableType: "Crud",
            projectId: this.projectId,
        })

        Route.create({
            name: `${paramCase(this.plural)}.edit`,
            method: "get",
            type: RouteType.ROUTE,
            path: `/${paramCase(this.plural)}/{${camelCase(this.name)}}`,
            routableId: this.id,
            routableType: "Crud",
            projectId: this.projectId,
        })
    }
}
