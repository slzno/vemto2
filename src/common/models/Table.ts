import Column from './Column'
import Project from './Project'
import RelaDB from '@tiago_silva_pereira/reladb'

export default class Table extends RelaDB.Model {
    id: string
    name: string
    projectId: string
    columns: Column[]

    static identifier() {
        return 'Table'
    }

    relationships() {
        return {
            project: () => this.belongsTo(Project),
            columns: () => this.hasMany(Column).cascadeDelete(),
        }
    }

    hasColumn(columnName: string): boolean {
        return this.columns.find((column) => column.name === columnName) !== undefined
    }

    doesNotHaveColumn(columnName: string): boolean {
        return !this.hasColumn(columnName)
    }

    static findByName(tableName: string): Table {
        return Table.get().find((table) => table.name === tableName)
    }
}
