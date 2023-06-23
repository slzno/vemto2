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

    findTableById(tableId: string): Table {
        return this.tables.find((table) => table.id === tableId)
    }

    findModelByName(modelName: string): Model {
        return this.models.find((model) => model.name === modelName)
    }

    findModelByClass(modelClass: string): Model {
        return this.models.find((model) => model.class === modelClass)
    }

    findModelById(modelId: string): Model {
        return this.models.find((model) => model.id === modelId)
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

    hasChangedTables(): boolean {
        if (!this.changedTablesIds) return false

        return this.changedTablesIds.length > 0
    }

    getChangedTables(): Table[] {
        if (!this.hasChangedTables()) return []

        return this.tables.filter((table) =>
            this.changedTablesIds.includes(table.id)
        )
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

    getRoutesByApplicationSection(section: string): Route[] {
        return this.routes.filter((route) => route.routable.section === section)
    }

    getAllApplicationsSections(): string[] {
        return this.getApplications().map((application) => application.section)
    }

    getApplicationsBySection(section: string): any[] {
        return this.getApplications().filter(
            (application) => application.section === section
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
}
