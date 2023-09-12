import Index from './Index'
import Model from './Model'
import Column from './Column'
import Project from './Project'
import DataComparator from './services/DataComparator'
import DataComparisonLogger from './services/DataComparisonLogger'
import Relationship from './Relationship'
import WordManipulator from '@Common/util/WordManipulator'
import AbstractSchemaModel from './composition/AbstractSchemaModel'

export default class Table extends AbstractSchemaModel implements SchemaModel {
    id: string
    name: string
    indexes: Index[]
    models: Model[]
    project: Project
    removed: boolean
    schemaState: any
    projectId: string
    columns: Column[]
    migrations: any[]
    positionX: number
    positionY: number
    labelColumn: Column
    labelColumnId: string
    needsMigration: boolean
    createdFromInterface: boolean

    relationships() {
        return {
            project: () => this.belongsTo(Project),
            models: () => this.hasMany(Model).cascadeDelete(),
            indexes: () => this.hasMany(Index).cascadeDelete(),
            labelColumn: () => this.belongsTo(Column, "labelColumnId"),
            columns: () => this.hasMany(Column).cascadeDelete().orderBy('order'),

            pivotRelationships: () => this.hasMany(Relationship, 'pivotId').cascadeDelete()
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

    undoRemove() {
        this.removed = false

        this.save()

        this.markAsChanged()
    }

    getOldName(): string {
        if(!this.schemaState) return this.name

        return this.schemaState.name
    }

    hasSchemaChanges(comparisonData: any): boolean {
        if(!this.schemaState) return true
        
        return this.hasDataChanges(comparisonData)
    }

    hasDataChanges(data: any): boolean {
        const dataComparisonMap = this.dataComparisonMap(data)

        return Object.keys(dataComparisonMap).some(key => dataComparisonMap[key])
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

    /**
     * The next two methods (buildSchemaState and dataComparisonMap) are extremely 
     * important to keep the state of the schema,
     * and both need to reflect the same data structure to avoid false positives when
     * comparing the data between the schema state and the current state.
     */
    buildSchemaState() {
        return {
            name: this.name,
            migrations: this.migrations,
        }
    }

    dataComparisonMap(comparisonData: any) {
        return {
            name: DataComparator.stringsAreDifferent(this.schemaState.name, comparisonData.name),
            migrations: DataComparator.arraysAreDifferent(this.schemaState.migrations, comparisonData.migrations),
        }
    }

    /**
     * The following method defines propertis that cannot be touched by the application without
     * enabling the isSavingInternally flag. It prevents the application from saving data
     * that is not supposed to be saved. The schemaState property is always protected when isSavingInternally
     * is disabled, even if the property is not defined here. The main reason for this is that some properties
     * can only be changed when reading the schema state from the application code, and never from the Vemto's
     * interface.
     * @returns {string[]}
     */
    static nonTouchableProperties(): string[] {
        return ['migrations']
    }

    isDirty(): boolean {
        const hasDirtyColumns = this.getColumns().some((column) => column.isDirty()),
            hasDirtyIndexes = this.getIndexes().some((index) => index.isDirty())

        return !this.isRemoved() && (this.hasLocalChanges() || hasDirtyColumns || hasDirtyIndexes)
    }

    hasLocalChanges(): boolean {
        if(!this.schemaState) return false

        return this.hasDataChanges(this)
    }

    logDataComparison(): void {
        console.log('Showing changes for table ' + this.name)

        DataComparisonLogger.setInstance(this).log()
    }

    hasColumn(columnName: string): boolean {
        return this.getColumns().find((column) => column.name === columnName) !== undefined
    }

    hasColumnExceptId(columnName: string, columnId: string): boolean {
        return this.getColumns().find((column) => column.name === columnName && column.id != columnId) !== undefined
    }

    hasPrimaryKey(): boolean {
        return this.getPrimaryKeyColumn() !== undefined
    }

    getPrimaryKeyColumn(): Column {
        return this.getColumns().find((column) => column.isPrimaryKey())
    }

    getPrimaryKeyName(): string {
        if(!this.hasPrimaryKey()) return ''

        return this.getPrimaryKeyColumn().name
    }

    getCreatedAtColumn(): Column {
        return this.getColumns().find((column) => column.isCreatedAt())
    }

    getUpdatedAtColumn(): Column {
        return this.getColumns().find((column) => column.isUpdatedAt())
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

    getForeignIndexes(): Index[] {
        return this.getIndexes().filter((index) => index.isForeign())
    }

    getUniqueIndexes(): Index[] {
        return this.getIndexes().filter((index) => index.isUnique())
    }

    hasPrimaryIndexForColumn(column: Column): boolean {
        return this.getIndexes().find((index: Index) => index.isPrimary() && index.hasColumn(column.name)) !== undefined
    }

    getColumns(): Column[] {
        return this.columns.filter((column) => !column.isRemoved())
    }

    getOrderedColumns(): Column[] {
        return this.getColumns().sort((a, b) => a.order - b.order)
    }

    getIndexes(): Index[] {
        return this.indexes.filter((index) => !index.isRemoved())
    }

    hasRelatedTables(): boolean {
        return !! this.getRelatedTables().length
    }

    getRelatedTables(): Table[] {
        let relatedTables: Table[] = [],
            relatedTablesIds: string[] = []

        this.getForeignIndexes().forEach((index) => {
            const foreignTable = index.getForeignTable()

            if(!foreignTable) return

            let relatedTable = this.project.findTableByName(foreignTable.name)

            if(relatedTable && !relatedTablesIds.includes(relatedTable.id)) {
                relatedTables.push(relatedTable)
                relatedTablesIds.push(relatedTable.id)
            }
        })
        
        this.getRelationships().forEach((relationship: Relationship) => {
            let relatedTable = relationship.relatedModel?.table

            if(relationship.pivot) {
                relatedTable = relationship.pivot

                if(relatedTable && !relatedTablesIds.includes(relatedTable.id)) {
                    relatedTables.push(relatedTable)
                    relatedTablesIds.push(relatedTable.id)
                }
            }

            if(relatedTable && !relatedTablesIds.includes(relatedTable.id)) {
                relatedTables.push(relatedTable)
                relatedTablesIds.push(relatedTable.id)
            }
        })

        return relatedTables
    }

    getModels(): Model[] {
        return this.models.filter((model: Model) => !model.isRemoved())
    }

    getRelationships(): Relationship[] {
        let relationships: Relationship[] = []

        this.getModels().forEach((model: Model) => {
            relationships = relationships
                .concat(model.ownRelationships)
        })

        return relationships
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
        const latestMigration = this.getLatestMigration(),
            tableName = this.getCanonicalName()

        return !! (latestMigration && latestMigration.createdTables.includes(tableName))
    }

    getCanonicalName(): string {
        return this.schemaState.name || this.name
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

    needsCreationMigration(): boolean {
        return !this.hasCreationMigration()
    }

    hasCreationMigration(): boolean {
        return !! this.getCreationMigration()
    }

    getCreationMigration(): any {
        if(!this.hasMigrations()) return null

        const tableName = this.getCanonicalName()

        return this.migrations.find((migration) => migration.createdTables.includes(tableName))
    }

    probablyNeedsToUpdateLatestMigration(): boolean {
        return this.canUpdateLatestMigration() 
            && this.latestMigrationCreatedTable()
            && this.wasRenamed()
    }

    canUpdateLatestMigration(): boolean {
        return this.hasMigrations() && !this.isRemoved()
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

    getColumnByName(columnName: string): Column {
        return this.columns.find(column => column.name == columnName)
    }

    addForeign(name: string, relatedModel: Model): Index {
        const column = this.getOrCreateForeignColumn(name, relatedModel)

        if(column.isForeign()) return

        const foreignName = `${WordManipulator.snakeCase(this.name)}_${WordManipulator.snakeCase(column.name)}_foreign`.toLowerCase(),
            primaryKeyColumn = relatedModel.getPrimaryKeyColumn(),
            foreign = new Index({
                tableId: this.id,
                name: foreignName,
                columns: [column.name],
                type: 'foreign',
                on: relatedModel.table.name,
                onTableId: relatedModel.table.id,
                references: primaryKeyColumn?.name,
                referencesColumnId: primaryKeyColumn?.id
            })
        
        foreign.save()
        foreign.relation('indexColumns').attachUnique(column)
        
        return foreign
    }

    getOrCreateForeignColumn(name: string, relatedModel: Model): Column {
        let column = this.getColumnByName(name),
            primaryKey = relatedModel.getPrimaryKeyColumn()

        if(!primaryKey) throw new Error('Related model has no primary key when trying to create foreign')

        if(!column) {
            column = new Column({
                tableId: this.id,
                modelId: this.id,
                name: name,
                type: primaryKey.getForeignType()
            })
        }

        // If is related with the same model, the field needs to be nullable
        if(this.id === relatedModel.id) {
            column.nullable = true
        }

        column.save()

        return column
    }

    getLabelColumnName(): string {
        return this.getLabelColumn().name || 'id'
    }

    getLabelColumn(): Column {
        if(this.labelColumn) return this.labelColumn

        let nameField = this.columns.find(column => column.name == 'name' || column.name == 'title'),
            firstStringField = this.columns.find(column => column.isTextual())

        if(nameField) return nameField

        if(firstStringField) return firstStringField

        return this.getPrimaryKeyColumn()
    }
}
