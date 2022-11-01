import Table from './Table'
import RelaDB from '@tiago_silva_pereira/reladb'

export default class Project extends RelaDB.Model {
    id: string
    path: string
    name: string
    tables: Table[]
    schemaDataHash: string
    laravelVersion: Number
    updatedTablesIds: string[]

    static identifier() {
        return 'Project'
    }

    relationships() {
        return {
            tables: () => this.hasMany(Table).cascadeDelete(),
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
        return this.tables.find((table) => table.name === tableName) !== undefined
    }

    doesNotHaveTable(tableName: string): boolean {
        return !this.hasTable(tableName)
    }

    findTableByName(tableName: string): Table {
        return this.tables.find((table) => table.name === tableName)
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

    hasUpdatedTables(): boolean {
        if(!this.updatedTablesIds) return false

        return this.updatedTablesIds.length > 0
    }

    markTableAsUpdated(table: Table) {
        if(!this.updatedTablesIds) this.updatedTablesIds = []
        
        if (this.updatedTablesIds.indexOf(table.id) === -1) {
            this.updatedTablesIds.push(table.id)
        }

        this.save()
    }

    clearUpdatedTables() {
        this.updatedTablesIds = []

        this.save()
    }
}
