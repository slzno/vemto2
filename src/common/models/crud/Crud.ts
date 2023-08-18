import Input from "./Input"
import CrudPanel from "./CrudPanel"
import Nav from "@Common/models/Nav"
import Model from "@Common/models/Model"
import Route, { RouteType } from "@Common/models/Route"
import { camelCase, capitalCase, paramCase, pascalCase } from "change-case"
import Column from "@Common/models/Column"
import Project from "@Common/models/Project"
import RelaDB from "@tiago_silva_pereira/reladb"
import AppSection from "../AppSection"

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
    type: CrudType
    section: AppSection
    sectionId: string
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
    navs: Nav[]
    hooks: any

    // Livewire specific
    livewireNamespace: string
    livewireIndexComponentName: string
    livewireShowComponentName: string
    livewireCreateComponentName: string
    livewireEditComponentName: string

    relationships() {
        return {
            model: () => this.belongsTo(Model),
            project: () => this.belongsTo(Project),
            section: () => this.belongsTo(AppSection, "sectionId"),
            inputs: () => this.hasMany(Input).cascadeDelete(),
            panels: () => this.hasMany(CrudPanel).cascadeDelete(),
            navs: () => this.morphMany(Nav, "navigable").cascadeDelete(),
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

        const defaultSection = AppSection.findDefaultAdminSection()

        const crud = new Crud()
        crud.type = CrudType.LIVEWIRE
        crud.name = paramCase(model.name)
        crud.plural = paramCase(model.plural)
        crud.sectionId = defaultSection ? defaultSection.id : null
        crud.modelId = model.id
        crud.projectId = model.projectId

        crud.calculateSettings()
        crud.calculateLiveWireSpecificData()

        if(defaultSearchColumn) crud.defaultSearchColumnId = defaultSearchColumn.id
        if(defaultSortColumn) crud.defaultSortColumnId = defaultSortColumn.id

        crud.defaultSortDirection = "desc"

        crud.save()

        crud.addInputsFromModel(model)
        crud.addRoutes()
        crud.addNavs()
    }

    getLabel(): string {
        return this.settings.collectionTitle
    }

    getAppType(): string {
        return 'CRUD'
    }

    getBasicInputs(): Input[] {
        return this.inputs.filter((input) => input.isCommon() || input.isBelongsTo())
    }

    getCommonInputs(): Input[] {
        return this.inputs.filter((input) => input.isCommon())
    }

    getFileInputs(): Input[] {
        return this.inputs.filter((input) => input.isFileOrImage())
    }

    getBelongsToInputs(): Input[] {
        return this.inputs.filter((input) => input.isBelongsTo())
    }

    calculateSettings() {
        this.settings = {
            itemTitle: capitalCase(this.model.name),
            collectionTitle: capitalCase(this.model.plural),
        }
    }

    calculateLiveWireSpecificData() {
        this.livewireNamespace = `App\\Http\\Livewire\\${pascalCase(this.section.name)}`
        this.livewireIndexComponentName = `${pascalCase(this.name)}Index`
        this.livewireShowComponentName = `${pascalCase(this.name)}Show`
        this.livewireCreateComponentName = `${pascalCase(this.name)}Create`
        this.livewireEditComponentName = `${pascalCase(this.name)}Edit`
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

            const input = Input.createFromColumn(this, column)
            input.panelId = panel.id
            input.save()
        })
    }

    addRoutes() {
        Route.create({
            name: `${paramCase(this.plural)}.index`,
            tag: "index",
            method: "get",
            type: RouteType.ROUTE,
            path: `/${paramCase(this.plural)}`,
            routableId: this.id,
            routableType: "Crud",
            projectId: this.projectId,
        })

        Route.create({
            name: `${paramCase(this.plural)}.create`,
            tag: "create",
            method: "get",
            type: RouteType.ROUTE,
            path: `/${paramCase(this.plural)}/create`,
            routableId: this.id,
            routableType: "Crud",
            projectId: this.projectId,
        })

        Route.create({
            name: `${paramCase(this.plural)}.edit`,
            tag: "edit",
            method: "get",
            type: RouteType.ROUTE,
            path: `/${paramCase(this.plural)}/{${camelCase(this.name)}}`,
            routableId: this.id,
            routableType: "Crud",
            projectId: this.projectId,
        })
    }

    addNavs() {
        const rootTag = Nav.findByTag("apps")

        const nav = Nav.create({
            name: this.settings.collectionTitle,
            navigableId: this.id,
            navigableType: "Crud",
            projectId: this.projectId,
        })

        if(rootTag) {
            nav.parentNavId = rootTag.id
            nav.save()
        }
    }

    getIndexRouteName(): string {
        return this.getRouteNameByTag("index")
    }

    getRouteNameByTag(tag: string): string {
        const route = this.routes.find((route) => route.tag === tag)

        if(! route) {
            throw new Error(`Route with tag ${tag} not found`)
        }

        if(!this.section) return route.name

        return `${paramCase(this.section.routePrefix)}.${route.name}`
    }

    getRouteContent(route: Route): string {
        if(this.type === CrudType.LIVEWIRE) {
            return this.getLivewireRouteContent(route)
        }

        return ''
    }

    getLivewireRouteContent(route: Route): string {
        const componentName = this.getLivewireComponentName(route)

        return `${this.livewireNamespace}\\${componentName}::class`
    }

    getLivewireComponentName(route: Route): string {
        switch(route.tag) {
            case "index": return this.livewireIndexComponentName
            case "create": return this.livewireCreateComponentName
            case "edit": return this.livewireEditComponentName
            case "show": return this.livewireShowComponentName
        }

        return "fn () => {}"
    }

    getHooks(type: string): any {
        return this.hooks ? this.hooks[type] || {} : {}
    }

    getHookByName(type: string, name: string): any {
        return this.getHooks(type)[name] || {}
    }

    saveHooks(type: string, hooks: any) {
        this.hooks = this.hooks || {}
        this.hooks[type] = hooks

        this.save()
    }
}
