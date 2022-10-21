import Column from './Column'
import Project from './Project'
import RelaDB from '@tiago_silva_pereira/reladb'

export default class Table extends RelaDB.Model {
    id: string
    name: string
    project: Project
    projectId: string
    columns: Column[]
    positionX: number
    positionY: number

    static identifier() {
        return 'Table'
    }

    relationships() {
        return {
            project: () => this.belongsTo(Project),
            columns: () => this.hasMany(Column).cascadeDelete(),
        }
    }

    static creating(tableData: any) {
        tableData.positionX = 0
        tableData.positionY = 0
        
        return tableData
    }

    hadChanges(comparisonData: any): boolean {
        return this.name !== comparisonData.name
    }

    applyChanges(data: any) {
        if(!this.hadChanges(data)) return
        
        this.name = data.name
        this.save()
    }

    hasColumn(columnName: string): boolean {
        return this.columns.find((column) => column.name === columnName) !== undefined
    }

    doesNotHaveColumn(columnName: string): boolean {
        return !this.hasColumn(columnName)
    }

    findColumnByName(columnName: string): Column {
        return this.columns.find((column) => column.name === columnName)
    }

    getColumnsNames(): string[] {
        return this.columns.map((column) => column.name)
    }

    getAllColumnsKeyedByName(): { [key: string]: Column } {
        return this.columns.reduce((columns, column) => {
            columns[column.name] = column
            return columns
        }, {})
    }

    hasRelatedTables(): boolean {
        return false
    }
}
