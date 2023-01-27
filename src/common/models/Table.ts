import Index from './Index'
import Column from './Column'
import Project from './Project'
import RelaDB from '@tiago_silva_pereira/reladb'

export default class Table extends RelaDB.Model {
    id: string
    name: string
    indexes: Index[]
    project: Project
    removed: boolean
    schemaState: any
    projectId: string
    columns: Column[]
    migrations: any[]
    positionX: number
    positionY: number
    needsMigration: boolean
    createdFromInterface: boolean

    static identifier() {
        return 'Table'
    }

    relationships() {
        return {
            project: () => this.belongsTo(Project),
            indexes: () => this.hasMany(Index).cascadeDelete(),
            columns: () => this.hasMany(Column).cascadeDelete(),
        }
    }

    static creating(tableData: any) {
        tableData.positionX = 0
        tableData.positionY = 0
        
        return tableData
    }

    saveFromInterface() {
        let creating = false

        if(!this.isSaved()) creating = true

        this.createdFromInterface = creating
        
        if(creating) {
            this.needsMigration = true
        }

        this.save()

        this.markAsChanged()

        return this
    }

    remove() {
        if(this.isNew()) {
            return this.delete()
        }
        
        this.removed = true

        this.save()

        this.markAsChanged()
    }

    getOldName(): string {
        if(!this.schemaState) return this.name

        return this.schemaState.name
    }

    hasSchemaChanges(comparisonData: any): boolean {
        return this.name !== comparisonData.name ||
            this.migrations !== comparisonData.migrations
    }

    applyChanges(data: any) {
        if(!this.hasSchemaChanges(data)) return false
        
        this.name = data.name
        this.migrations = data.migrations
        this.createdFromInterface = false

        this.fillSchemaState()

        this.save()

        return true
    }

    saveSchemaState() {
        this.fillSchemaState()

        this.save()
    }

    fillSchemaState() {
        this.schemaState = this.buildSchemaState()
    }

    buildSchemaState() {
        return {
            name: this.name,
        }
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
        return this.getColumns().filter((column) => column.hasLocalChanges())
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

    hasIndex(indexName: string): boolean {
        return this.getIndexes().find((index) => index.name === indexName) !== undefined
    }

    doesNotHaveIndex(indexName: string): boolean {
        return !this.hasIndex(indexName)
    }

    findIndexByName(indexName: string): Index {
        return this.getIndexes().find((index) => index.name === indexName)
    }

    getRenamedIndexes(): Index[] {
        return this.getIndexes().filter((index) => index.wasRenamed())
    }

    getRemovedIndexes(): Index[] {
        return this.indexes.filter((index) => index.isRemoved())
    }

    getNewIndexes(): Index[] {
        return this.getIndexes().filter((index) => index.isNew())
    }

    getChangedIndexes(): Index[] {
        return this.getIndexes().filter((index) => index.hasLocalChanges())
    }

    getNotRenamedChangedIndexes(): Index[] {
        return this.getChangedIndexes().filter((index) => !index.wasRenamed())
    }

    getIndexesNames(): string[] {
        return this.getIndexes().map((index) => index.name)
    }

    getAllIndexesKeyedByName(): { [key: string]: Index } {
        return this.getIndexes().reduce((indexes, index) => {
            indexes[index.name] = index
            return indexes
        }, {})
    }

    hasPrimaryIndexForColumn(column: Column): boolean {
        return this.getIndexes().find((index: Index) => index.isPrimary() && index.hasColumn(column.name)) !== undefined
    }

    getColumns(): Column[] {
        return this.columns.filter((column) => !column.isRemoved())
    }

    getIndexes(): Index[] {
        return this.indexes.filter((index) => !index.isRemoved())
    }

    hasRelatedTables(): boolean {
        return true
    }

    getRelatedTables(): Table[] {
        // let relatedMap = {
        //     'users': [6, 7]
        // }

        // let tableMap = relatedMap[this.name] || []

        // return tableMap.map(relatedTableId => Table.find(relatedTableId))

        return []
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

    hasCreationMigration(): boolean {
        return !! this.getCreationMigration()
    }

    latestMigrationCreatedTable(): boolean {
        let latestMigration = this.getLatestMigration()

        return !! (latestMigration && latestMigration.createdTables.includes(this.name))
    }

    getLatestMigration(): any {
        if(!this.hasMigrations()) return null

        return this.migrations[this.migrations.length - 1] || null
    }

    getLatestUpdaterMigration(): any {
        const latestMigration = this.getLatestMigration()

        if(!latestMigration) return null

        if(latestMigration.createdTables.includes(this.name)) return null

        return latestMigration
    }

    getCreationMigration(): any {
        return this.migrations.find((migration) => migration.createdTables.includes(this.name))
    }

    canUpdateLatestMigration(): boolean {
        return this.hasMigrations()
    }

    needsCreationMigration(): boolean {
        return !! this.needsMigration
    }

    wasCreatedFromInterface(): boolean {
        return !! this.createdFromInterface
    }

    canCreateNewMigration(): boolean {
        return true
    }

    isNew(): boolean {
        return !this.schemaState
    }

    wasRenamed(): boolean {
        if(!this.schemaState) return false
        
        return this.schemaState.name !== this.name
    }

    isRemoved(): boolean {
        return !! this.removed
    }
}
