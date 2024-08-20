import Input from "./Input"
import Table from "../Table"
import CrudPanel from "./CrudPanel"
import Nav from "@Common/models/Nav"
import AppSection from "../AppSection"
import Model from "@Common/models/Model"
import Column from "@Common/models/Column"
import HasManyDetail from "./HasManyDetail"
import Project from "@Common/models/Project"
import MorphManyDetail from "./MorphManyDetail"
import RelaDB from "@tiago_silva_pereira/reladb"
import MorphToManyDetail from "./MorphToManyDetail"
import BelongsToManyDetail from "./BelongsToManyDetail"
import Route, { RouteType } from "@Common/models/Route"
import WordManipulator from "@Common/util/WordManipulator"
import { camelCase, capitalCase, paramCase, pascalCase } from "change-case"
import GenerateCrudApiRoutes from "./services/GenerateCrudApiRoutes"

export enum CrudType {
    DEFAULT = "Default",
    API = "API",
    VUE = "Vue",
    LIVEWIRE = "Livewire",
    FILAMENT = "Filament",
    NOVA = "Nova"
}

export enum CrudSubType {
    DEFAULT = "Default",
    HAS_MANY_DETAIL = "Has Many Detail",
    MORPH_MANY_DETAIL = "Morph Many Detail",
    BELONGS_TO_MANY_DETAIL = "Belongs To Many Detail",
    MORPH_TO_MANY_DETAIL = "Morph To Many Detail"
}

export interface CrudSettings {
    itemName: string
    collectionName: string
    itemTitle: string
    collectionTitle: string
}

export interface FilamentCrudSettings {
    recordTitle: string
    shouldSkipAuthorization: boolean
    modelLabel: string
    pluralModelLabel: string
    navigationLabel: string
    navigationIcon: string
    navigationOrder: number
    hasTitleCaseModelLabel: boolean
    navigationParentItem: string
    navigationGroup: string
    slug: string
}

export interface NovaCrudSettings {
    displayInNavigation: boolean
    group: string
    tableStyle: "default" | "tight"
    showColumnBorders: boolean
    clickAction: "detail" | "edit" | "select" | "preview" | "ignore"
    trafficCop: boolean
    polling: boolean
    pollingInterval: number
    showPollingToggle: boolean
    debounce: number
}

export default class Crud extends RelaDB.Model {
    id: string
    name: string
    plural: string
    type: CrudType
    section: AppSection
    sectionId: string
    tableId: string
    table: Table
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

    hasManyDetails: HasManyDetail[]
    relatedHasManyDetails: HasManyDetail[]
    isHasManyDetail: boolean

    morphManyDetails: MorphManyDetail[]
    relatedMorphManyDetails: MorphManyDetail[]
    isMorphManyDetail: boolean

    belongsToManyDetails: BelongsToManyDetail[]
    relatedBelongsToManyDetails: BelongsToManyDetail[]
    isBelongsToManyDetail: boolean

    morphToManyDetails: MorphToManyDetail[]
    relatedMorphToManyDetails: MorphToManyDetail[]
    isMorphToManyDetail: boolean

    basePath: string

    // Livewire specific
    livewireNamespace: string
    livewireFormsNamespace: string
    livewireIndexComponentName: string
    livewireShowComponentName: string
    livewireCreateComponentName: string
    livewireEditComponentName: string

    filamentSettings: FilamentCrudSettings
    novaSettings: NovaCrudSettings
    
    relationships() {
        return {
            model: () => this.belongsTo(Model),
            table: () => this.belongsTo(Table),
            project: () => this.belongsTo(Project),
            section: () => this.belongsTo(AppSection, "sectionId"),
            inputs: () => this.hasMany(Input).cascadeDelete(),
            panels: () => this.hasMany(CrudPanel).cascadeDelete(),
            navs: () => this.morphMany(Nav, "navigable").cascadeDelete(),
            routes: () => this.morphMany(Route, "routable").cascadeDelete(),
            defaultSearchColumn: () => this.belongsTo(Column, "defaultSearchColumnId"),
            defaultSortColumn: () => this.belongsTo(Column, "defaultSortColumnId"),

            hasManyDetails: () => this.hasMany(HasManyDetail).cascadeDelete(),
            relatedHasManyDetails: () => this.hasMany(HasManyDetail, "detailCrudId").cascadeDelete(),

            morphManyDetails: () => this.hasMany(MorphManyDetail).cascadeDelete(),
            relatedMorphManyDetails: () => this.hasMany(MorphManyDetail, "detailCrudId").cascadeDelete(),

            belongsToManyDetails: () => this.hasMany(BelongsToManyDetail).cascadeDelete(),
            relatedBelongsToManyDetails: () => this.hasMany(BelongsToManyDetail, "detailCrudId").cascadeDelete(),

            morphToManyDetails: () => this.hasMany(MorphToManyDetail).cascadeDelete(),
            relatedMorphToManyDetails: () => this.hasMany(MorphToManyDetail, "detailCrudId").cascadeDelete(),
        }
    }

    static deleting(crud: Crud) {
        const hasCrudWithSameTranslation = (translationProperty: string) => Crud.get().filter(
            (otherCrud: Crud) => otherCrud.id !== crud.id && otherCrud.settings[translationProperty] === crud.settings[translationProperty]
        ).length > 0

        if(!hasCrudWithSameTranslation('itemTitle')) {
            crud.project.deleteTranslationOnAllLanguages(crud.getLangKeyForItemTitle())
        }

        if(!hasCrudWithSameTranslation('collectionTitle')) {
            crud.project.deleteTranslationOnAllLanguages(crud.getLangKeyForCollectionTitle())
        }
    }

    static getBasic() {
        return Crud.get().filter((crud: Crud) => crud.isBasic() && crud.isValid())
    }

    static getApis() {
        return Crud.get().filter((crud: Crud) => crud.isApi() && !crud.isDetail())
    }

    static getFilamentResources() {
        return Crud.get().filter((crud: Crud) => crud.isForFilament() && !crud.isDetail())
    }

    static getNovaResources() {
        return Crud.get().filter((crud: Crud) => crud.isForNova() && !crud.isDetail())
    }

    isInvalid(): boolean {
        return ! this.isValid()
    }

    isValid(): boolean {
        return !! (this.name && this.type)
            && !this.hasInvalidHasManyDetails()
    }

    hasInvalidHasManyDetails(): boolean {
        return this.hasManyDetails.filter((detail) => {
            return detail.isInvalid()
        }).length > 0
    }

    isBasic() {
        return !this.isDetail() && !this.isForFilament() && !this.isApi() && !this.isForNova()
    }

    isDetail() {
        return this.isHasManyDetail || this.isMorphManyDetail || this.isBelongsToManyDetail || this.isMorphToManyDetail
    }

    isApi() {
        return this.type === CrudType.API
    }

    hasDefaultSearchColumn(): boolean {
        return !! this.defaultSearchColumn
    }

    hasDefaultSortColumn(): boolean {
        return !! this.defaultSortColumn
    }

    static createFromModel(
        model: Model,
        crudType: CrudType = CrudType.LIVEWIRE,
        excludedColumns: Column[] = [],
        generateDetails: boolean = false
    ) {
        const defaultSearchColumn = model.table.getLabelColumn(),
            crudIsForFilament = crudType == CrudType.FILAMENT,
            crudIsForNova = crudType == CrudType.NOVA

        const defaultSortColumn = model.table.getUpdatedAtColumn() 
            || model.table.getCreatedAtColumn()
            || model.table.getPrimaryKeyColumn()
            || defaultSearchColumn

        let defaultSection = AppSection.findDefaultDashboardSection()
        
        if(crudIsForFilament) {
            defaultSection = AppSection.findDefaultFilamentPanelSection()
        }

        if(crudType === CrudType.API) {
            defaultSection = AppSection.findDefaultApiPanelSection()
        }

        const crud = new Crud()
        crud.type = crudType
        crud.name = pascalCase(model.name)
        crud.plural = pascalCase(model.plural)
        crud.sectionId = defaultSection ? defaultSection.id : null
        crud.modelId = model.id
        crud.tableId = model.tableId
        crud.projectId = model.projectId
        crud.basePath = capitalCase(model.plural)

        crud.calculateSettings()
        crud.calculateLivewireSpecificData()

        if(defaultSearchColumn) crud.defaultSearchColumnId = defaultSearchColumn.id
        if(defaultSortColumn) crud.defaultSortColumnId = defaultSortColumn.id

        crud.defaultSortDirection = "desc"

        if(crudIsForFilament) crud.calculateFilamentSettings()
        if(crudIsForNova) crud.calculateNovaSettings()

        crud.save()

        crud.addInputsFromModel(model, excludedColumns)

        if(generateDetails) {
            crud.addHasManyDetails()
            crud.addBelongsToManyDetails()
        }

        if(!crudIsForFilament && !crudIsForNova) {
            crud.addRoutes()
            
            if(crud.type != CrudType.API) crud.addNavs()
        }

        return crud
    }

    static createDetailFromModel(
        model: Model,
        crudType: CrudType = CrudType.LIVEWIRE,
        excludedColumns: Column[] = []
    ) {
        const defaultSearchColumn = model.table.getLabelColumn(),
            crudIsForFilament = crudType == CrudType.FILAMENT,
            crudIsForNova = crudType == CrudType.NOVA

        const defaultSortColumn = model.table.getUpdatedAtColumn() 
            || model.table.getCreatedAtColumn()
            || model.table.getPrimaryKeyColumn()
            || defaultSearchColumn

        let defaultSection = AppSection.findDefaultDashboardSection()
    
        if(crudIsForFilament) {
            defaultSection = AppSection.findDefaultFilamentPanelSection()
        }

        if(crudType === CrudType.API) {
            defaultSection = AppSection.findDefaultApiPanelSection()
        }

        const crud = new Crud()
        crud.type = crudType
        crud.name = capitalCase(model.name)
        crud.plural = capitalCase(model.plural)
        crud.sectionId = defaultSection ? defaultSection.id : null
        crud.modelId = model.id
        crud.tableId = model.tableId
        crud.projectId = model.projectId
        crud.basePath = capitalCase(model.plural)

        crud.calculateSettings()
        crud.calculateLivewireSpecificData()

        if(defaultSearchColumn) crud.defaultSearchColumnId = defaultSearchColumn.id
        if(defaultSortColumn) crud.defaultSortColumnId = defaultSortColumn.id

        crud.defaultSortDirection = "desc"

        if(crudIsForFilament) crud.calculateFilamentSettings()
        if(crudIsForNova) crud.calculateNovaSettings()

        crud.save()

        crud.addInputsFromModel(model, excludedColumns)

        return crud
    }

    static createFromTable(
        table: Table,
        crudType: CrudType = CrudType.LIVEWIRE,
        excludedColumns: Column[] = []
    ) {
        const defaultSearchColumn = table.getLabelColumn(),
            crudIsForFilament = crudType == CrudType.FILAMENT,
            crudIsForNova = crudType == CrudType.NOVA

        const defaultSortColumn = table.getUpdatedAtColumn() 
            || table.getCreatedAtColumn()
            || table.getPrimaryKeyColumn()
            || defaultSearchColumn

        let defaultSection = AppSection.findDefaultDashboardSection()
    
        if(crudIsForFilament) {
            defaultSection = AppSection.findDefaultFilamentPanelSection()
        }

        if(crudType === CrudType.API) {
            defaultSection = AppSection.findDefaultApiPanelSection()
        }

        const crudName = WordManipulator.runMultiple(
            ['singularize', 'pascalCase'],
            table.name
        )

        const crud = new Crud()
        crud.type = crudType
        crud.name = capitalCase(crudName)
        crud.plural = capitalCase(table.name)
        crud.sectionId = defaultSection ? defaultSection.id : null
        crud.tableId = table.id
        crud.projectId = table.projectId
        crud.basePath = capitalCase(table.name)

        crud.calculateSettings(crudName, table.name)
        crud.calculateLivewireSpecificData()
        
        if(defaultSearchColumn) crud.defaultSearchColumnId = defaultSearchColumn.id
        if(defaultSortColumn) crud.defaultSortColumnId = defaultSortColumn.id

        crud.defaultSortDirection = "desc"

        if(crudIsForFilament) crud.calculateFilamentSettings()
        if(crudIsForNova) crud.calculateNovaSettings()

        crud.save()

        crud.addInputsFromTable(table, excludedColumns)

        if(!crudIsForFilament) {
            crud.addRoutes()
            crud.addNavs()
        }

        return crud
    }

    static createDetailFromTable(
        table: Table,
        crudType: CrudType = CrudType.LIVEWIRE,
        excludedColumns: Column[] = []
    ) {
        const defaultSearchColumn = table.getLabelColumn(),
            crudIsForFilament = crudType == CrudType.FILAMENT,
            crudIsForNova = crudType == CrudType.NOVA

        const defaultSortColumn = table.getUpdatedAtColumn() 
            || table.getCreatedAtColumn()
            || table.getPrimaryKeyColumn()
            || defaultSearchColumn

        let defaultSection = AppSection.findDefaultDashboardSection()
    
        if(crudIsForFilament) {
            defaultSection = AppSection.findDefaultFilamentPanelSection()
        }

        if(crudType === CrudType.API) {
            defaultSection = AppSection.findDefaultApiPanelSection()
        }

        const crudName = WordManipulator.runMultiple(
            ['singularize', 'pascalCase'],
            table.name
        )

        const crud = new Crud()
        crud.type = crudType
        crud.name = capitalCase(crudName)
        crud.plural = capitalCase(table.name)
        crud.sectionId = defaultSection ? defaultSection.id : null
        crud.tableId = table.id
        crud.projectId = table.projectId
        crud.basePath = capitalCase(table.name)

        crud.calculateSettings(crudName, table.name)
        crud.calculateLivewireSpecificData()
        
        if(defaultSearchColumn) crud.defaultSearchColumnId = defaultSearchColumn.id
        if(defaultSortColumn) crud.defaultSortColumnId = defaultSortColumn.id

        crud.defaultSortDirection = "desc"

        if(crudIsForFilament) crud.calculateFilamentSettings()
        if(crudIsForNova) crud.calculateNovaSettings()

        crud.save()

        crud.addInputsFromTable(table, excludedColumns)

        return crud
    }

    static createFakeFromModel(
        model: Model,
        data: any = {},
        crudType: CrudType = CrudType.LIVEWIRE,
        excludedColumns: Column[] = []
    ) {
        const defaultSearchColumn = model.table.getLabelColumn(),
            crudIsForFilament = crudType == CrudType.FILAMENT,
            crudIsForNova = crudType == CrudType.NOVA

        const defaultSortColumn = model.table.getUpdatedAtColumn() 
            || model.table.getCreatedAtColumn()
            || model.table.getPrimaryKeyColumn()
            || defaultSearchColumn

        let defaultSection = AppSection.findDefaultDashboardSection()
    
        if(crudIsForFilament) {
            defaultSection = AppSection.findDefaultFilamentPanelSection()
        }

        if(crudType === CrudType.API) {
            defaultSection = AppSection.findDefaultApiPanelSection()
        }

        const crud = new Crud()
        crud.type = crudType
        crud.name = data.name || capitalCase(model.name)
        crud.plural = capitalCase(model.plural)
        crud.sectionId = defaultSection ? defaultSection.id : null
        crud.modelId = model.id
        crud.tableId = model.tableId
        crud.projectId = model.projectId
        crud.basePath = capitalCase(model.plural)

        crud.calculateSettings()
        crud.calculateLivewireSpecificData()

        if(defaultSearchColumn) crud.defaultSearchColumnId = defaultSearchColumn.id
        if(defaultSortColumn) crud.defaultSortColumnId = defaultSortColumn.id

        crud.defaultSortDirection = "desc"

        if(crudIsForFilament) crud.calculateFilamentSettings()
        if(crudIsForNova) crud.calculateNovaSettings()

        crud.addFakeInputsFromModel(model, excludedColumns)

        return crud
    }

    isOnlyTableCrud(): boolean {
        return !this.modelId && !!this.tableId
    }

    getLabel(): string {
        return this.project.getDefaultTranslation(this.settings.collectionTitle) || this.settings.collectionTitle
    }

    getSingularLabel(): string {
        return this.project.getDefaultTranslation(this.settings.itemTitle) || this.settings.itemTitle
    }

    getAppSubType(): string {
        if(this.isHasManyDetail) return CrudSubType.HAS_MANY_DETAIL
        if(this.isMorphManyDetail) return CrudSubType.MORPH_MANY_DETAIL
        if(this.isBelongsToManyDetail) return CrudSubType.BELONGS_TO_MANY_DETAIL
        if(this.isMorphToManyDetail) return CrudSubType.MORPH_TO_MANY_DETAIL

        return this.getAppType()
    }

    getAppType(): string {
        if(this.type === CrudType.FILAMENT) return "FILAMENT"
        if(this.type === CrudType.NOVA) return "NOVA"
        if(this.type === CrudType.API) return "API Resource"

        return "CRUD"
    }

    isManyToManyDetail(): boolean {
        return this.isBelongsToManyDetail || this.isMorphToManyDetail
    }

    isCommonDetail(): boolean {
        return this.isHasManyDetail || this.isMorphManyDetail
    }

    getBasicInputs(): Input[] {
        return this.inputs.filter((input) => input.isCommon() || input.isBelongsTo())
    }

    getCommonInputs(): Input[] {
        return this.inputs.filter((input) => input.isCommon())
    }

    hasFileInputs(): boolean {
        return this.getFileInputs().length > 0
    }

    getFileInputs(): Input[] {
        return this.inputs.filter((input) => input.isFileOrImage())
    }

    getBelongsToInputs(): Input[] {
        return this.inputs.filter((input) => input.isBelongsTo())
    }

    hasBelongsToInputs(): boolean {
        return this.getBelongsToInputs().length > 0
    }

    getFillableInputs(): Input[] {
        return this.inputs.filter((input) => !input.isPassword())
    }

    getInputsWithDefaultValue(): Input[] {
        return this.inputs.filter((input) => input.defaultValue?.length)
    }

    getInputsForIndex(): Input[] {
        return this.getOrderedInputs().filter((input) => input.showOnIndex)
    }

    hasPasswordInputs(): boolean {
        return this.getPasswordInputs().length > 0
    }

    getPasswordInputs(): Input[] {
        return this.inputs.filter((input) => input.isPassword())
    }

    hasJsonInputs(): boolean {
        return this.getJsonInputs().length > 0
    }

    getJsonInputs(): Input[] {
        return this.inputs.filter((input) => input.isJson())
    }

    hasHasManyDetails(): boolean {
        return this.hasManyDetails.length > 0
    }

    hasBelongsToManyDetails(): boolean {
        return this.belongsToManyDetails.length > 0
    }

    hasMorphToManyDetails(): boolean {
        return this.morphToManyDetails.length > 0
    }

    hasMorphManyDetails(): boolean {
        return this.morphManyDetails.length > 0
    }

    getInputsForIndexExcept(excludedInputs: Input | Input[]): Input[] {
        let excludedInputIds = []

        if(!Array.isArray(excludedInputs)) {
            excludedInputIds = [excludedInputs.id]
        } else {
            excludedInputIds = excludedInputs.map((input) => input.id)
        }

        return this.getInputsForIndex().filter((input) => !excludedInputIds.includes(input.id))
    }

    getInputsForCreate(): Input[] {
        return this.getOrderedInputs().filter((input) => input.showOnCreation)
    }

    getInputsForUpdate(): Input[] {
        return this.getOrderedInputs().filter((input) => input.showOnUpdate)
    }

    getInputsForDetails(): Input[] {
        return this.getOrderedInputs().filter((input) => input.showOnDetails)
    }

    getOrderedInputs(): Input[] {
        return this.inputs.sort((a, b) => a.order - b.order)
    }

    getInputsForForms(): Input[] {
        return this.getOrderedInputs().filter((input) => input.showOnCreation || input.showOnUpdate)
    }

    getInputsForNovaDetailForms(): Input[] {
        return this.getOrderedInputs().filter((input) => input.showOnCreation || input.showOnUpdate || input.showOnIndex)
    }

    getInputsForFormsExcept(excludedInputs: Input | Input[]): Input[] {
        let excludedInputIds = []

        if(!Array.isArray(excludedInputs)) {
            excludedInputIds = [excludedInputs.id]
        } else {
            excludedInputIds = excludedInputs.map((input) => input.id)
        }

        return this.getInputsForForms().filter((input) => !excludedInputIds.includes(input.id))
    }

    getManyToManyDetails(): (BelongsToManyDetail | MorphToManyDetail)[] {
        return [...this.belongsToManyDetails, ...this.morphToManyDetails]
    }

    calculateSettings(name: string = null, plural: string = null) {
        if(!name) {
            name = this.isOnlyTableCrud() ? WordManipulator.singularize(this.table.name) : this.model.name
        }

        if(!plural) {
            plural = this.isOnlyTableCrud() ? this.table.name : this.model.plural
        }

        this.settings = {
            itemName: camelCase(name),
            collectionName: camelCase(plural),
            itemTitle: null,
            collectionTitle: null,
        }
        
        this.settings.itemTitle = this.generateTranslationForItemTitle(capitalCase(name))
        this.settings.collectionTitle = this.generateTranslationForCollectionTitle(capitalCase(plural))
    }

    calculateLivewireSpecificData() {
        this.livewireNamespace = `App\\Livewire\\${pascalCase(this.section.name)}`
        this.livewireFormsNamespace = `${this.livewireNamespace}\\${pascalCase(this.basePath)}\\Forms`

        this.livewireIndexComponentName = `${pascalCase(this.name)}Index`
        this.livewireShowComponentName = `${pascalCase(this.name)}Show`
        this.livewireCreateComponentName = `${pascalCase(this.name)}Create`
        this.livewireEditComponentName = `${pascalCase(this.name)}Edit`
    }

    addInputsFromModel(model: Model, excludedColumns: Column[] = []) {
        const panel = new CrudPanel()
        panel.title = 'Main'
        panel.crudId = this.id
        panel.order = 0
        panel.save()

        const excludedColumnsIds = excludedColumns
            .filter((column) => column)
            .map((column: Column) => column.id)

        model.table.getColumns().forEach((column: Column) => {
            if(excludedColumnsIds.includes(column.id)) return
            if(column.isPrimaryKey()) return
            if(column.isDefaultLaravelTimestamp()) return

            if(model.columnIsHiddenForCrudCreation(column)) return

            const input = Input.createFromColumn(this, column)
            input.panelId = panel.id
            input.save()
        })
    }

    addFakeInputsFromModel(model: Model, excludedColumns: Column[] = []) {
        const panel = new CrudPanel()
        panel.title = 'Main'
        panel.crud = this
        panel.order = 0

        const excludedColumnsIds = excludedColumns
            .filter((column) => column)
            .map((column: Column) => column.id)

        model.table.getColumns().forEach((column: Column) => {
            if(excludedColumnsIds.includes(column.id)) return
            if(column.isPrimaryKey()) return
            if(column.isDefaultLaravelTimestamp()) return

            if(model.columnIsHiddenForCrudCreation(column)) return

            const input = Input.fakeFromColumn(this, column)
            input.panel = panel

            this.inputs.push(input)
        })
    }

    addInputsFromTable(table: Table, excludedColumns: Column[] = []) {
        const panel = new CrudPanel()
        panel.title = 'Main'
        panel.crudId = this.id
        panel.order = 0
        panel.save()

        const excludedColumnsIds = excludedColumns
            .filter((column) => column)
            .map((column: Column) => column.id)

        table.getColumns().forEach((column: Column) => {
            if(excludedColumnsIds.includes(column.id)) return
            if(column.isPrimaryKey()) return
            if(column.isDefaultLaravelTimestamp()) return

            if(column.isHiddenForCrudCreation()) return

            const input = Input.createFromColumn(this, column, null, true)
            input.panelId = panel.id
            input.save()
        })
    }

    getBaseRoutePath() {
        return `/${paramCase(this.settings.collectionName)}`
    }

    getBaseRouteName() {
        return paramCase(this.settings.collectionName)
    }

    addRoutes() {
        if(this.type == CrudType.API) {
            new GenerateCrudApiRoutes(this).generate()
            return;
        }

        Route.create({
            name: `${this.getBaseRouteName()}.index`,
            tag: "index",
            method: "get",
            type: RouteType.ROUTE,
            path: `${this.getBaseRoutePath()}`,
            routableId: this.id,
            routableType: "Crud",
            projectId: this.projectId,
        })

        Route.create({
            name: `${this.getBaseRouteName()}.create`,
            tag: "create",
            method: "get",
            type: RouteType.ROUTE,
            path: `${this.getBaseRoutePath()}/create`,
            routableId: this.id,
            routableType: "Crud",
            projectId: this.projectId,
        })

        Route.create({
            name: `${this.getBaseRouteName()}.edit`,
            tag: "edit",
            method: "get",
            type: RouteType.ROUTE,
            path: `${this.getBaseRoutePath()}/{${camelCase(this.name)}}`,
            routableId: this.id,
            routableType: "Crud",
            projectId: this.projectId,
        })
    }

    addNavs() {
        const rootTag = Nav.findByTag("apps")

        const nav = Nav.createFromNavigable(
            this.getLabel(),
            this.projectId,
            this.id,
            "Crud"
        )

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

    getFirstRelatedHasManyDetail(): HasManyDetail {
        if(!this.relatedHasManyDetails.length) return null

        return this.relatedHasManyDetails[0]
    }

    getFirstRelatedMorphManyDetail(): MorphManyDetail {
        if(!this.relatedMorphManyDetails.length) return null

        return this.relatedMorphManyDetails[0]
    }

    getFirstRelatedBelongsToManyDetail(): BelongsToManyDetail {
        if(!this.relatedBelongsToManyDetails.length) return null

        return this.relatedBelongsToManyDetails[0]
    }

    getFirstRelatedMorphToManyDetail(): MorphToManyDetail {
        if(!this.relatedMorphToManyDetails.length) return null

        return this.relatedMorphToManyDetails[0]
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

    addHasManyDetails() {
        this.model.getHasManyRelations().forEach((relationship) => {
            HasManyDetail.createFromRelation(this, relationship)
        })

        return this
    }

    addBelongsToManyDetails() {
        this.model.getBelongsToManyRelations().forEach((relationship) => {
            BelongsToManyDetail.createFromRelation(this, relationship)
        })

        return this
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

    getBaseLangKey(): string {
        return `crud.${this.settings.collectionName}`
    }
    
    calculateFilamentSettings() {
        this.filamentSettings = {
            modelLabel: this.settings.itemTitle,
            pluralModelLabel: this.settings.collectionTitle,
            navigationLabel: this.settings.collectionTitle,
            navigationIcon: "heroicon-o-rectangle-stack",
            navigationOrder: 1,
            navigationParentItem: null,
            hasTitleCaseModelLabel: true,
            navigationGroup: "Admin",
            slug: null
        } as FilamentCrudSettings
    }
    
    calculateNovaSettings() {
        this.novaSettings = {
            displayInNavigation: !this.isDetail(),
            group: "Admin",
            tableStyle: "default",
            showColumnBorders: false,
            clickAction: "detail",
            trafficCop: true,
            polling: false,
            pollingInterval: 0,
            showPollingToggle: false,
            debounce: 0
        } as NovaCrudSettings
    }

    isForFilament(): boolean {
        return this.type === CrudType.FILAMENT
    }

    isForNova(): boolean {
        return this.type === CrudType.NOVA
    }

    isForLivewire(): boolean {
        return this.type === CrudType.LIVEWIRE
    }

    generateTranslationForItemTitle(defaultItemTitle: string) {
        const key = this.getLangKeyForItemTitle()

        this.project.setTranslationOnAllLanguages(key, defaultItemTitle)

        return key
    }

    generateTranslationForCollectionTitle(defaultCollectionTitle: string) {
        const key = this.getLangKeyForCollectionTitle()

        this.project.setTranslationOnAllLanguages(key, defaultCollectionTitle)

        return key
    }

    getLangKeyForItemTitle(): string {
        return `${this.getBaseLangKey()}.itemTitle`
    }
    
    getLangKeyForCollectionTitle(): string {
        return `${this.getBaseLangKey()}.collectionTitle`
    }
}
