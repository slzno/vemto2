import Nav from "./Nav"
import Route from "./Route"
import Table from "./Table"
import Model from "./Model"
import Crud from "./crud/Crud"
import Page from "./page/Page"
import RelaDB from "@tiago_silva_pereira/reladb"

import RenderableFile, {
    RenderableFileStatus,
    RenderableFileType,
} from "./RenderableFile"
import GenerateBasicProjectData from "./services/project/GenerateBasicProjectData"
import AppSection from "./AppSection"
import CalculateSchemaChanges from "./services/project/CalculateSchemaChanges"

export default class Project extends RelaDB.Model {
    id: string
    path: string
    name: string
    navs: Nav[]
    cruds: Crud[]
    pages: Page[]
    tables: Table[]
    models: Model[]
    routes: Route[]
    appSections: AppSection[]
    laravelVersion: Number
    schemaTablesDataHash: string
    schemaModelsDataHash: string
    changedTablesIds: string[]
    renderableFiles: RenderableFile[]
    currentRenderedFilesPaths: string[]
    vthemeKeys: any
    currentSchemaError: string
    scrollX: number
    scrollY: number

    lastForeignAlias: number = 0;

    relationships() {
        return {
            navs: () => this.hasMany(Nav).cascadeDelete(),
            cruds: () => this.hasMany(Crud).cascadeDelete(),
            pages: () => this.hasMany(Page).cascadeDelete(),
            tables: () => this.hasMany(Table).cascadeDelete(),
            models: () => this.hasMany(Model).cascadeDelete(),
            routes: () => this.hasMany(Route).cascadeDelete(),
            appSections: () => this.hasMany(AppSection).cascadeDelete(),
            renderableFiles: () => this.hasMany(RenderableFile).cascadeDelete(),
        }
    }

    static findOrCreate(): Project {
        let project = Project.find(1)

        if (project === null) {
            project = new Project()
            project.save()
        }

        return project
    }

    isEmtpy(): boolean {
        return this.id === undefined
    }

    setPath(path: string) {
        this.path = path
    }

    getPath(): string {
        return this.path
    }

    getApplications(): any[] {
        return [...this.cruds, ...this.pages]
    }

    deleteAllApplications() {
        this.cruds.forEach((crud) => crud.delete())
        this.pages.forEach((page) => page.delete())
    }

    hasTable(tableName: string): boolean {
        return (
            this.tables.find((table) => table.name === tableName) !== undefined
        )
    }

    doesNotHaveTable(tableName: string): boolean {
        return !this.hasTable(tableName)
    }

    findTableByName(tableName: string): Table {
        return this.tables.find((table) => table.name === tableName)
    }

    findTableBySchemaStateName(schemaStateName: string): Table {
        return this.tables.find(
            (table) => table.schemaState.name === schemaStateName
        )
    }

    findTableById(tableId: string): Table {
        return this.tables.find((table) => table.id == tableId)
    }

    findModelByName(modelName: string): Model {
        return this.models.find((model) => model.name === modelName)
    }

    findModelByClass(modelClass: string): Model {
        return this.models.find((model) => model.class === modelClass)
    }

    findModelById(modelId: string): Model {
        return this.models.find((model) => model.id == modelId)
    }

    getTablesNames(): string[] {
        return this.tables.map((table) => table.name)
    }

    getAllTablesKeyedByName(): { [key: string]: Table } {
        let tables: { [key: string]: Table } = {}

        this.tables.forEach((table) => {
            tables[table.name] = table
        })

        return tables
    }

    getModelsNames(): string[] {
        return this.models.map((model) => model.name)
    }

    getModelsPlurals(): string[] {
        return this.models.map((model) => model.plural)
    }

    getAllModelsKeyedByName(): { [key: string]: Model } {
        let models: { [key: string]: Model } = {}

        this.models.forEach((model) => {
            models[model.name] = model
        })

        return models
    }

    getModelsClasses(): string[] {
        return this.models.map((model) => model.class)
    }

    getAllModelsKeyedByClass(): { [key: string]: Model } {
        let models: { [key: string]: Model } = {}

        this.models.forEach((model) => {
            models[model.class] = model
        })

        return models
    }

    hasSchemaChanges(): boolean {
        const changesCalculator = new CalculateSchemaChanges(this)
        
        return changesCalculator.hasChanges()
    }

    getChangedTables(): Table[] {
        if (!this.hasSchemaChanges()) return []

        return new CalculateSchemaChanges(this).getAllTables()
    }

    getRenamedTables(): Table[] {
        return this.getTables().filter((table) => table.wasRenamed())
    }

    getRemovedTables(): Table[] {
        return this.tables.filter((table) => table.isRemoved())
    }

    getNewTables(): Table[] {
        return this.getTables().filter((table) => table.isNew())
    }

    getTables(): Table[] {
        return this.tables.filter((table) => !table.isRemoved())
    }

    getRoutesByRoutableType(type: string): Route[] {
        return this.routes.filter((route) => route.routableType === type)
    }

    getApplicationsBySection(section: AppSection): any[] {
        return this.getApplications().filter(
            (application) => application.sectionId === section.id
        )
    }

    getNonRemovedRenderableFiles(): RenderableFile[] {
        return this.renderableFiles.filter(
            (renderableFile) => !renderableFile.wasRemoved()
        )
    }

    getRemovedRenderableFiles(): RenderableFile[] {
        return this.renderableFiles.filter((renderableFile) =>
            renderableFile.wasRemoved()
        )
    }

    getConflictRenderableFiles(): RenderableFile[] {
        return this.renderableFiles.filter(
            (renderableFile) => renderableFile.hasConflict()
        )
    }

    clearRemovedFiles() {
        this.getRemovedRenderableFiles().forEach((renderableFile) =>
            renderableFile.delete()
        )
    }

    markTableAsChanged(table: Table) {
        if (!this.changedTablesIds) this.changedTablesIds = []

        if (this.changedTablesIds.indexOf(table.id) === -1) {
            this.changedTablesIds.push(table.id)
        }

        this.save()
    }

    clearChangedTables() {
        this.changedTablesIds = []

        this.save()
    }

    removeTableFromChangedTables(table: Table) {
        if (!this.changedTablesIds) return

        const index = this.changedTablesIds.indexOf(table.id)
        if (index > -1) {
            this.changedTablesIds.splice(index, 1)
        }

        this.save()
    }

    registerRenderableFile(
        path: string,
        name: string,
        template: string,
        type: RenderableFileType = RenderableFileType.PHP_CLASS
    ) : RenderableFile {
        let renderableFile: RenderableFile = null

        const fullPath = `${path}/${name}`

        this.registerCurrentRenderedFilePath(fullPath)

        renderableFile = this.renderableFiles.find(
            (renderableFile) =>
                renderableFile.path === path &&
                renderableFile.name === name &&
                renderableFile.template === template
        )

        if (!renderableFile) {
            renderableFile = new RenderableFile()
            renderableFile.path = path
            renderableFile.name = name
            renderableFile.fullPath = fullPath
            renderableFile.template = template
            renderableFile.projectId = this.id
            renderableFile.type = type
        }

        renderableFile.status = RenderableFileStatus.PREPARING

        renderableFile.save()

        return renderableFile
    }

    hasRenderableFilesWithConflict(): boolean {
        return this.renderableFiles.some(
            (renderableFile) => renderableFile.status === RenderableFileStatus.CONFLICT
        )
    }

    clearCurrentRenderedFilesPaths() {
        this.currentRenderedFilesPaths = []
        this.save()
    }

    registerCurrentRenderedFilePath(path: string) {
        if (!this.currentRenderedFilesPaths) this.currentRenderedFilesPaths = []

        this.currentRenderedFilesPaths.push(path)
        this.save()
    }

    getCurrentRenderedFilesPaths(): string[] {
        return this.currentRenderedFilesPaths
    }

    processRemovableFiles() {
        const removableFiles = this.getRemovableFiles()

        removableFiles.forEach((path) => {
            path.markToRemove()
        })
    }

    getRemovableFiles(): RenderableFile[] {
        let removableFiles: RenderableFile[] = []

        const latestRenderedFiles = this.renderableFiles.filter(file => file.isRemovable())

        if (!latestRenderedFiles) return removableFiles

        latestRenderedFiles.forEach((file) => {
            if (!this.currentRenderedFilesPaths.includes(file.fullPath)) {
                removableFiles.push(file)
            }
        })

        return removableFiles
    }

    getRootNavs(): Nav[] {
        return this.navs.filter(nav => nav.isRoot())
    }

    generateBasicData() {
        (new GenerateBasicProjectData(this)).handle()
    }

    getVthemeKeys(): { [key: string]: string } {
        return this.vthemeKeys || {}
    }

    getVthemeKey(keyName): string {
        if (!this.vthemeKeys) return null
        return this.vthemeKeys[keyName] || null
    }

    hasVthemeKey(keyName): boolean {
        if (!this.vthemeKeys) return false
        return typeof this.vthemeKeys[keyName] !== 'undefined'
    }

    setVthemeKey(keyName, value) {
        if (!this.vthemeKeys) this.vthemeKeys = {}
        this.vthemeKeys[keyName] = value
        this.save()
    }

    saveVthemeKeys(vthemeKeys: any) {
        this.vthemeKeys = vthemeKeys
        this.save()
    }

    hasCurrentSchemaError(): boolean {
        return !!this.currentSchemaError
    }

    setCurrentSchemaError(error: string) {
        this.currentSchemaError = error
        this.save()
    }

    clearCurrentSchemaError() {
        this.currentSchemaError = null
        this.save()
    }

    hasScroll(): boolean {
        return !! this.scrollX && !! this.scrollY
    }

    centerScroll(canvasWidth, canvasHeight, baseSize: number = 50000) {
        this.scrollX = (baseSize / 2) - (canvasWidth / 2)
        this.scrollY = (baseSize / 2) - (canvasHeight / 2)
        this.save()
    }

    saveScroll(x: number, y: number) {
        console.log('saving scroll', x, y)
        this.scrollX = x
        this.scrollY = y
        this.save()
    }
}
