import Table from "./Table"
import Model from "./Model"
import RelaDB from "@tiago_silva_pereira/reladb"

import RenderableFile, {
    RenderableFileStatus,
    RenderableFileType,
} from "./RenderableFile"

export default class Project extends RelaDB.Model {
    id: string
    path: string
    name: string
    tables: Table[]
    models: Model[]
    laravelVersion: Number
    schemaTablesDataHash: string
    schemaModelsDataHash: string
    changedTablesIds: string[]
    renderableFiles: RenderableFile[]

    static identifier() {
        return "Project"
    }

    relationships() {
        return {
            tables: () => this.hasMany(Table).cascadeDelete(),
            models: () => this.hasMany(Model).cascadeDelete(),
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
        data: any
    ) {
        let renderableFile: RenderableFile = null

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
            renderableFile.template = template
            renderableFile.projectId = this.id
            renderableFile.data = data
            renderableFile.type = RenderableFileType.PHP_CLASS
        }

        renderableFile.status = RenderableFileStatus.PENDING

        return renderableFile.save()
    }
}
