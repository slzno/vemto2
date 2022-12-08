import Column from './Column'
import Project from './Project'
import RelaDB from '@tiago_silva_pereira/reladb'

export default class Table extends RelaDB.Model {
    id: string
    name: string
    migrations: any[]
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
        return this.name !== comparisonData.name ||
            this.migrations !== comparisonData.migrations
    }

    applyChanges(data: any) {
        if(!this.hadChanges(data)) return
        
        this.name = data.name
        this.migrations = data.migrations
        this.save()
    }

    hasColumn(columnName: string): boolean {
        return this.getColumns().find((column) => column.name === columnName) !== undefined
    }

    doesNotHaveColumn(columnName: string): boolean {
        return !this.hasColumn(columnName)
    }

    findColumnByName(columnName: string): Column {
        return this.getColumns().find((column) => column.name === columnName)
    }

    getRenamedColumns(): Column[] {
        return this.getColumns().filter((column) => column.wasRenamed())
    }

    getRemovedColumns(): Column[] {
        return this.columns.filter((column) => column.isRemoved())
    }

    getNewColumns(): Column[] {
        return this.getColumns().filter((column) => column.isNew())
    }

    getChangedColumns(): Column[] {
        return this.getColumns().filter((column) => column.hasChanges())
    }

    getNotRenamedChangedColumns(): Column[] {
        return this.getChangedColumns().filter((column) => !column.wasRenamed())
    }

    getColumnsNames(): string[] {
        return this.getColumns().map((column) => column.name)
    }

    getAllColumnsKeyedByName(): { [key: string]: Column } {
        return this.getColumns().reduce((columns, column) => {
            columns[column.name] = column
            return columns
        }, {})
    }

    getColumns(): Column[] {
        return this.columns.filter((column) => !column.isRemoved())
    }

    hasRelatedTables(): boolean {
        return true
    }

    getRelatedTables(): Table[] {
        let relatedMap = {
            'users': [6, 7]
        }

        let tableMap = relatedMap[this.name] || []

        return tableMap.map(relatedTableId => Table.find(relatedTableId))
    }

    getModels(): any[] {
        let modelsMap = {
            'users': [{
                name: 'User.php',
                relationships: [
                    {type: 'hasMany', model: 'Post'}
                ]
            }],
            'posts': [{
                name: 'Post.php',
                relationships: [
                    {type: 'belongsTo', model: 'User'}
                ]
            }],
            'videos': [{
                name: 'Video.php',
                relationships: [
                    {type: 'belongsTo', model: 'User'}
                ]
            }]
        }

        return modelsMap[this.name] || []
    }

    hasTimestamps(): boolean {
        return this.hasColumn('created_at') 
            && this.hasColumn('updated_at')
    }

    hasSoftDeletes(): boolean {
        return this.hasColumn('deleted_at')
    }

    markAsChanged() {
        this.project.markTableAsChanged(this)
        return this
    }

    hasMigrations(): boolean {
        return (!! this.migrations) && this.migrations.length > 0
    }

    latestMigrationCreatedTable(): boolean {
        let latestMigration = this.getLatestMigration()

        return !! (latestMigration && latestMigration.createdTables.includes(this.name))
    }

    getLatestMigration(): any {
        if(!this.hasMigrations()) return null

        return this.migrations[this.migrations.length - 1] || null
    }

    getCreationMigration(): any {
        return this.migrations.find((migration) => migration.createdTables.includes(this.name))
    }

    canUpdateLatestMigration(): boolean {
        return this.hasMigrations()
    }

    canCreateNewMigration(): boolean {
        return true
    }
}
