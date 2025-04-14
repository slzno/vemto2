import Index from './Index'
import Model from './Model'
import Column from './Column'
import Project from './Project'
import DataComparator from './services/DataComparator'
import DataComparisonLogger from './services/DataComparisonLogger'
import Relationship from './Relationship'
import WordManipulator from '@Common/util/WordManipulator'
import AbstractSchemaModel from './composition/AbstractSchemaModel'
import CreateDefaultTableColumns from './services/tables/CreateDefaultTableColumns'
import CreateDefaultTableModel from './services/tables/CreateDefaultTableModel'
import SchemaSection from './SchemaSection'

interface TableMigration {
    createdTables: string[]
    changedTables: string[]
    renamedTables: string[]
    datePrefix: string
    fullPrefix: string
    migration: string // the full migration path
    migrationName: string
    relativePath: string // the path relative to the project root
}

export default class Table extends AbstractSchemaModel implements SchemaModel {
    id: string
    name: string
    oldNames: string[]
    indexes: Index[]
    models: Model[]
    project: Project
    removed: boolean
    projectId: string
    columns: Column[]
    migrations: TableMigration[]
    positionX: number
    positionY: number
    labelColumn: Column
    labelColumnId: string
    section: SchemaSection
    sectionId: string
    createdFromInterface: boolean
    pivotRelationships: Relationship[]

    relationships() {
        return {
            project: () => this.belongsTo(Project),
            models: () => this.hasMany(Model).cascadeDelete(),
            indexes: () => this.hasMany(Index).cascadeDelete(),
            labelColumn: () => this.belongsTo(Column, "labelColumnId"),
            columns: () => this.hasMany(Column).cascadeDelete().orderBy('order'),
            pivotRelationships: () => this.hasMany(Relationship, 'pivotId').cascadeDelete(),
            section: () => this.belongsTo(SchemaSection, "sectionId"),
        }
    }

    static creating(data: any): any {
        data = Table.addSectionToTableDataIfNecessary(data)

        return data
    }

    static created(table: Table) {
        table.centerPosition()
    }

    static updating(data: any): any {
        data = Table.addSectionToTableDataIfNecessary(data)

        return data
    }

    static addSectionToTableDataIfNecessary(data: any): any {
        const defaultSchemaSection = Project.defaultSchemaSection()

        if(!data.sectionId && defaultSchemaSection) {
            data.sectionId = defaultSchemaSection ? defaultSchemaSection.id : null
        }

        return data
    }

    isValid(): boolean {
        return !! this.name
    }

    saveFromInterface(addModel: boolean = false) {
        let creating = false

        if(!this.isSaved()) creating = true

        this.createdFromInterface = creating

        this.save()

        if(creating) CreateDefaultTableColumns.setTable(this).create()
        if(addModel) CreateDefaultTableModel.setTable(this).create()

        return this
    }

    remove() {
        if(this.isNew()) {
            return this.delete()
        }
        
        this.removed = true

        this.pivotRelationships.forEach((relationship) => relationship.remove())

        this.save()
    }

    undoRemove() {
        this.removed = false

        this.save()
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
        this.oldNames = data.oldNames
        this.createdFromInterface = false
        this.labelColumnId = null

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
            oldNames: DataComparator.cloneArray(this.oldNames),
            migrations: DataComparator.cloneArray(this.migrations),
        }
    }

    dataComparisonMap(comparisonData: any) {
        return {
            name: DataComparator.stringsAreDifferent(this.schemaState.name, comparisonData.name),
            oldNames: DataComparator.arraysAreDifferent(this.schemaState.oldNames, comparisonData.oldNames),
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
        const hasDirtyResources = this.hasDirtyResources()

        return !this.isRemoved() && (this.hasLocalChanges() || hasDirtyResources)
    }

    hasDirtyResources(): boolean {
        return this.hasDirtyColumns() || this.hasDirtyIndexes()
    }

    hasDirtyColumns(): boolean {
        return this.columns && this.columns.some((column) => column.isDirty())
    }

    hasDirtyIndexes(): boolean {
        return this.indexes && this.indexes.some((index) => index.isDirty())
    }

    hasLocalChanges(): boolean {
        if(!this.schemaState) return false

        return this.hasDataChanges(this)
    }

    getFirstTableName(): string {
        if(!this.oldNames || !this.oldNames.length) return this.getCanonicalName()

        return this.oldNames[0]
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
        return this.getValidColumns().find((column) => column.isPrimaryKey())
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
    
    findColumnById(id: string): Column {
        return this.getColumns().find((column) => column.id === id)
    }

    getRenamedColumns(): Column[] {
        return this.getValidColumns().filter((column) => column.wasRenamed())
    }

    getRemovedColumns(): Column[] {
        return this.columns.filter((column) => column.isRemoved())
    }

    getNewColumns(): Column[] {
        return this.getValidColumns().filter((column) => column.isNew())
    }

    getChangedColumns(): Column[] {
        return this.getValidColumns().filter((column) => column.hasLocalChanges())
    }

    getNotRenamedChangedColumns(): Column[] {
        return this.getChangedColumns().filter((column) => {
            return !column.wasRenamed() && !column.changedOnlyImplicitUnique()
        })
    }

    getColumnsWithRemovedUnique(): Column[] {
        return this.getValidColumns().filter((column) => column.implicitUniqueWasRemoved())
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

    getAllRemovedColumnsKeyedByName(): { [key: string]: Column } {
        return this.getRemovedColumns().reduce((columns, column) => {
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
        return this.indexes.map((index) => index.name)
    }

    getAllIndexesKeyedByName(): { [key: string]: Index } {
        return this.indexes.reduce((indexes, index) => {
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
        if(!this.columns) return []

        return this.columns.filter((column) => !column.isRemoved())
    }

    hasUniqueColumns(): boolean {
        return !! this.getUniqueColumns().length
    }

    getUniqueColumns(): Column[] {
        return this.getColumns().filter((column) => column.isUnique())
    }

    getValidColumns(): Column[] {
        return this.getColumns().filter((column) => !! column.type?.length && !! column.name?.length)
    }

    getAllOrderedColumns(): Column[] {
        if(!this.columns) return []
        return this.columns.sort((a, b) => a.order - b.order)
    }

    getOrderedColumns(): Column[] {
        return this.getColumns().sort((a, b) => a.order - b.order)
    }

    getFirstColumn(): Column {
        const columns = this.getOrderedColumns()

        if(!columns.length) return null

        return columns[0]
    }

    getLastColumn(): Column {
        const columns = this.getOrderedColumns()

        if(!columns.length) return null

        return columns[columns.length - 1]
    }

    getFirstDefaultDateColumn(): Column {
        return this.getOrderedColumns().find((column) => column.isDefaultDate())
    }

    getLastDefaultDateColumn(): Column {
        return this.getOrderedColumns().reverse().find((column) => column.isDefaultDate())
    }

    getIndexes(): Index[] {
        return this.indexes.filter((index) => !index.isRemoved())
    }
    
    hasNewRelatedTables(): boolean {
        return this.getRelatedTables().some((table) => table.isNew())
    }

    hasDirtyRelatedTables(): boolean {
        return this.getRelatedTables().some((table) => table.isDirty())
    }

    hasRelatedTables(): boolean {
        return !! this.getRelatedTables().length
    }

    cannotBeChildrenOf(table: Table): boolean {
        return ! this.canBeChildrenOf(table)
    }

    canBeChildrenOf(table: Table): boolean {
        if(!table) return false

        if(!table.isNew()) return true

        if(this.isParentOf(table)) return false

        return true
    }

    isParentOf(table: Table): boolean {
        return table.isChildrenOf(this)
    }

    isChildrenOf(table: Table): boolean {
        let isChildren: boolean = false

        this.getForeignIndexes().forEach((index) => {
            const foreignTable = index.getForeignTable()

            if(!foreignTable) return

            if(foreignTable.id === table.id) {
                isChildren = true
            }
        })

        return isChildren
    }

    hasChildrenTables(): boolean {
        return !! this.getChildrenTables().length
    }

    getChildrenTables(): Table[] {
        return this.project.tables.filter((table) => table.isChildrenOf(this))
    }

    hasParentTables(): boolean {
        return !! this.getParentTables().length
    }

    getParentTables(): Table[] {
        return this.project.tables.filter((table) => table.isParentOf(this))
    }

    getRelatedTables(): Table[] {
        return this.getRelatedTablesRelations().map((relation) => relation.table)
    }

    getRelatedTablesRelationsOnSection(section: SchemaSection): any[] {
        return this.getRelatedTablesRelations()
            .filter((relation) => relation.table.sectionId === section.id)
    }

    getRelatedTablesRelations(): any[] {
        let relatedTables: any = {},
            relatedTablesIds: string[] = []

        this.getForeignIndexes().forEach((index) => {
            const foreignTable = index.getForeignTable()

            if(!foreignTable) return

            if(foreignTable && !relatedTablesIds.includes(foreignTable.id)) {
                
                relatedTables[foreignTable.id] = {
                    table: foreignTable,
                    type: 'foreign',
                }

                relatedTablesIds.push(foreignTable.id)
            }
        })
        
        this.getRelationships().forEach((relationship: Relationship) => {
            let relatedTable = relationship.relatedModel?.table

            if(relationship.pivot) {
                relatedTable = relationship.pivot
            }

            if(relatedTable) {
                if(relatedTablesIds.includes(relatedTable.id)) {
                    const existingTable = relatedTables[relatedTable.id]

                    if(existingTable) {
                        existingTable.type = 'both'
                    }
                } else {
                    relatedTables[relatedTable.id] = {
                        table: relatedTable,
                        type: 'relationship',
                    }

                    relatedTablesIds.push(relatedTable.id)
                }
            }
        })

        return Object.values(relatedTables)
    }

    getModels(): Model[] {
        if(!this.models) return []
        return this.models.filter((model: Model) => !model.isRemoved())
    }

    getRelationships(): Relationship[] {
        let relationships: Relationship[] = []

        this.getModels().forEach((model: Model) => {
            relationships = relationships
                .concat(model.getValidOwnRelationships())
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

    hasMigrations(): boolean {
        return (!! this.migrations) && this.migrations.length > 0
    }

    latestMigrationCreatedTable(): boolean {
        const latestMigration = this.getLatestMigration(),
            tableName = this.getCanonicalName()

        return !! (latestMigration && latestMigration.createdTables.includes(tableName))
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
        if(this.project.isBlueprintModeEnabled()) return this.isNew()

        return !this.hasCreationMigration() && !this.isRemoved()
    }

    hasCreationMigration(): boolean {
        return !! this.getCreationMigration()
    }

    getCreationMigration(): any {
        if(!this.hasMigrations()) return null

        const tableName = this.getFirstTableName()
        
        return this.migrations.find((migration) => migration.createdTables.includes(tableName))
    }

    registerCreationMigration(name: string): void {
        if(!this.hasMigrations()) this.migrations = []

        const tableName = this.getFirstTableName()

        this.migrations.push({
            createdTables: [tableName],
            changedTables: [],
            datePrefix: '',
            fullPrefix: '',
            migration: '',
            migrationName: name,
            relativePath: ''
        })
    }

    probablyNeedsToUpdateLatestMigration(): boolean {
        return this.canUpdateLatestMigration() 
            && this.latestMigrationCreatedTable()
            && this.wasRenamed()
    }

    canUpdateLatestMigration(): boolean {
        return this.hasMigrations() 
            && !this.isRemoved() 
            && !this.hasNewRelatedTables()
    }

    wasCreatedFromInterface(): boolean {
        return !! this.createdFromInterface
    }

    canCreateNewMigration(): boolean {
        return true
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
                referencesColumnId: primaryKeyColumn?.id,
                onUpdate: 'cascade',
                onDelete: 'cascade'
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
                name: name,
                type: primaryKey.getForeignType(),
                unsigned: primaryKey.isUnsigned(),
            })
        }

        // TODO: save column order

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

    undoAllChanges() {
        this.undoChanges()
        this.undoAllColumnsChanges()
        this.undoAllIndexesChanges()
    }

    undoAllColumnsChanges() {
        this.columns.forEach(column => column.undoChanges())
    }

    undoAllIndexesChanges() {
        this.indexes.forEach(index => index.undoChanges())
    }

    belongsToASection(): boolean {
        return !! this.sectionId
    }

    moveToSection(section: SchemaSection) {
        this.sectionId = section.id

        this.centerPosition()

        this.save()
    }

    centerPosition() {
        this.positionX = 0
        this.positionY = 0

        this.save()
    }

    isNovaTable(): boolean {
        return [
            "nova_notifications",
            "nova_field_attachments",
            "nova_pending_field_attachments",
            "action_events",
        ].includes(this.name)
    }

    isLaravelDefaultTable(): boolean {
        return [
            "password_reset_tokens", 
            "personal_access_tokens",
            "sessions", 
            "migrations",
            "cache",
            "cache_locks",
            "jobs",
            "job_batches",
            "failed_jobs",
        ].includes(this.name)
    }

    isJetstreamDefaultTable(): boolean {
        return [
            "teams", 
            "team_user", 
            "team_invitations"
        ].includes(this.name)
    }

    getColumnsOrders(): any[] {
        return this.getOrderedColumns().map((column) => {
            return {
                name: column.name,
                order: column.order
            }
        })
    }

    fixAllColumnsOrder() {
        this.getOrderedColumns().forEach((column, index) => {
            column.order = index
            column.save()
        })
    }
}
