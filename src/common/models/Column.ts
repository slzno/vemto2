import Table from './Table'
import Input from './crud/Input'
import ColumnData from './data/ColumnData'
import DataComparator from './services/DataComparator'
import ColumnTypeList from './column-types/base/ColumnTypeList'
import DataComparisonLogger from './services/DataComparisonLogger'
import Model from './Model'
import ColumnsDefaultDataList, { ColumnDefaultData } from './column-types/default/ColumnsDefaultDataList'
import Relationship from './Relationship'
import AbstractSchemaModel from './composition/AbstractSchemaModel'
import Index from './Index'
import IndexColumn from './IndexColumn'

export default class Column extends AbstractSchemaModel implements SchemaModel {
    id: string
    name: string
    type: string
    table: Table
    order: number
    index: boolean
    length: number
    unique: boolean
    tableId: string
    removed: boolean
    schemaState: any
    nullable: boolean
    unsigned: boolean
    default: string
    total: number
    places: number
    autoIncrement: boolean
    faker: string
    options: string[]
    inputs: Input[]
    referencedIndexes: Index[]
    columnIndexes: Index[]

    relationshipsByForeignKey: Relationship[]
    relationshipsByOwnerKey: Relationship[]
    relationshipsByParentKey: Relationship[]
    relationshipsByForeignPivotKey: Relationship[]
    relationshipsByRelatedPivotKey: Relationship[]
    relationshipsByMorphIdColumn: Relationship[]
    relationshipsByMorphTypeColumn: Relationship[]

    constructor(data: any = {}) {
        const columnData = Object.assign(ColumnData.getDefault(), data)

        super(columnData)
    }

    relationships() {
        return {
            table: () => this.belongsTo(Table),
            inputs: () => this.hasMany(Input).cascadeDelete(),
            referencedIndexes: () => this.hasMany(Index, 'referencesColumnId').cascadeDelete(),
            columnIndexes: () => this.belongsToMany(Index, IndexColumn).cascadeDetach(),

            // Relationships with Relationship class
            relationshipsByForeignKey: () => this.hasMany(Relationship, 'foreignKeyId').cascadeDelete(),
            relationshipsByOwnerKey: () => this.hasMany(Relationship, 'ownerKeyId').cascadeDelete(),
            relationshipsByParentKey: () => this.hasMany(Relationship, 'parentKeyId').cascadeDelete(),
            relationshipsByForeignPivotKey: () => this.hasMany(Relationship, 'foreignPivotKeyId').cascadeDelete(),
            relationshipsByRelatedPivotKey: () => this.hasMany(Relationship, 'relatedPivotKeyId').cascadeDelete(),
            relationshipsByMorphIdColumn: () => this.hasMany(Relationship, 'idColumnId').cascadeDelete(),
            relationshipsByMorphTypeColumn: () => this.hasMany(Relationship, 'typeColumnId').cascadeDelete(),
        }
    }
    

    static created(column: Column) {
        column.faker = column.getDefaultFaker()

        if(typeof column.order === "undefined") {
            column.reorder()
        }

        column.save()
    }

    static deleting(column: Column) {
        column.columnIndexes.forEach((index: Index) => {
            if(index.includesOnlyColumn(column)) {
                index.delete()
            }
        })
    }

    reorder(): void {
        let nextOrder = 0
        
        const tableColumns = this.table.getOrderedColumns(),
            firstTableDateColumn = tableColumns.find(orderedColumn => orderedColumn.isDeletedAt() || orderedColumn.isCreatedAt() || orderedColumn.isUpdatedAt())

        if(firstTableDateColumn) {
            nextOrder = firstTableDateColumn.order

            tableColumns.forEach(orderedColumn => {
                if(orderedColumn.order < nextOrder || this.id == orderedColumn.id) return

                orderedColumn.order++
                orderedColumn.save()
            })
        } else {
            nextOrder = tableColumns[tableColumns.length - 1].order + 1
        }

        this.order = nextOrder

        this.save()

        this.table.getOrderedColumns().forEach((orderedColumn, index) => {
            if(orderedColumn.id === this.id) {
                this.order = index
            }

            orderedColumn.order = index
            orderedColumn.save()
        })
    }

    saveFromInterface() {
        let creating = false

        if(!this.isSaved()) creating = true

        this.save()

        return this
    }

    remove() {
        if(this.isNew()) {
            return this.delete()
        }
        
        this.removed = true

        this.save()
    }

    isDefaultLaravelPrimaryKey(): boolean {
        return this.isAutoIncrement() 
            && this.name === 'id'
            && this.type === 'bigInteger'
            && this.unsigned === true
    }

    isPrimaryKey(): boolean {
        return this.isAutoIncrement() || this.table.hasPrimaryIndexForColumn(this)
    }

    isAutoIncrement(): boolean {
        return !! this.autoIncrement
    }

    isForeignKey(): boolean {
        return this.isForeign()
    }

    isForeign(): boolean {
        const foreignIndexes = this.table.getForeignIndexes()
        
        return foreignIndexes.some(index => index.indexColumns.map((column: Column) => column.id).includes(this.id))
    }

    isUniqueFromIndex(): boolean {
        const uniqueIndexes = this.table.getUniqueIndexes()

        return uniqueIndexes.some(index => index.indexColumns.map((column: Column) => column.id).includes(this.id))
    }

    isUnique(): boolean {
        return this.isImplicitlyUnique() || this.isUniqueFromIndex()
    }

    isImplicitlyUnique(): boolean {
        return !! this.unique
    }

    isSpecialPrimaryKey(): boolean {
        return this.type === 'uuid'
    }

    isDefaultLaravelTimestamp(): boolean {
        return this.name === 'created_at' || this.name === 'updated_at'
    }

    isTextual(): boolean {
        return ['string', 'text', 'char', 'date', 'datetime', 'timestamp'].includes(this.type)
    }

    isCreatedAt(): boolean {
        return this.name === 'created_at'
    }

    isDeletedAt(): boolean {
        return this.name === 'deleted_at'
    }

    isUpdatedAt(): boolean {
        return this.name === 'updated_at'
    }

    hasFaker(): boolean {
        return !! this.faker
    }

    hasBelongsToRelationsWithModel(model: Model): boolean {
        return this.getBelongsToRelationsWithModel(model).length > 0
    }

    getFirstBelongsToRelationWithModel(model: Model): Relationship {
        return this.getBelongsToRelationsWithModel(model)[0]
    }

    getBelongsToRelationsWithModel(model: Model): Relationship[] {
        return this.getBelongsToRelations().filter(relationship => relationship.relatedModelId === model.id)
    }

    hasBelongsToRelations(): boolean {
        return this.getBelongsToRelations().length > 0
    }

    getFirstBelongsToRelation(): Relationship {
        return this.getBelongsToRelations()[0]
    }

    getBelongsToRelations(): Relationship[] {
        return this.relationshipsByForeignKey
            .filter(relationship => relationship.type === 'BelongsTo') || []
    }

    hasImplicitIndex(): boolean {
        return !! this.index
    }

    isDirty(): boolean {
        return this.hasLocalChanges() || this.isRemoved() || this.isNew()
    }

    hasLocalChanges(): boolean {
        if(!this.schemaState) return false

        return this.hasDataChanges(this)
    }

    hasSchemaChanges(schemaData: any): boolean {
        if(!this.schemaState) return true 
        
        // Order is only checked here because Laravel migrations don't support changing the order of columns
        const orderWasChanged = DataComparator.numbersAreDifferent(this.schemaState.order, schemaData.order)

        return this.hasDataChanges(schemaData) || orderWasChanged
    }

    hasDataChanges(comparisonData: any): boolean {
        const dataComparisonMap = this.dataComparisonMap(comparisonData)

        return Object.keys(dataComparisonMap).some(key => dataComparisonMap[key])
    }

    applyChanges(data: any): boolean {
        if(!this.hasSchemaChanges(data)) return false

        this.name = data.name
        this.order = data.order
        this.length = data.length
        this.nullable = data.nullable
        this.unsigned = data.unsigned
        this.type = data.type
        this.index = data.index
        this.unique = data.unique
        this.autoIncrement = data.autoIncrement
        this.default = data.default
        this.total = data.total
        this.places = data.places

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
            length: this.length,
            nullable: this.nullable,
            unsigned: this.unsigned,
            autoIncrement: this.autoIncrement,
            type: this.type,
            index: this.index,
            unique: this.unique,
            default: this.default,
            total: this.total,
            places: this.places
        }
    }

    dataComparisonMap(comparisonData: any): any {
        return {
            name: DataComparator.stringsAreDifferent(this.schemaState.name, comparisonData.name),
            type: DataComparator.stringsAreDifferent(this.schemaState.type, comparisonData.type),
            length: DataComparator.numbersAreDifferent(this.schemaState.length, comparisonData.length),
            nullable: DataComparator.booleansAreDifferent(this.schemaState.nullable, comparisonData.nullable),
            autoIncrement: DataComparator.booleansAreDifferent(this.schemaState.autoIncrement, comparisonData.autoIncrement),
            unsigned: DataComparator.booleansAreDifferent(this.schemaState.unsigned, comparisonData.unsigned),
            index: DataComparator.booleansAreDifferent(this.schemaState.index, comparisonData.index),
            unique: DataComparator.booleansAreDifferent(this.schemaState.unique, comparisonData.unique),
            default: DataComparator.stringsAreDifferent(this.schemaState.default, comparisonData.default),
            total: DataComparator.numbersAreDifferent(this.schemaState.total, comparisonData.total),
            places: DataComparator.numbersAreDifferent(this.schemaState.places, comparisonData.places),
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
        return []
    }

    getAfter(): string {
        if(!this.hasPreviousColumn()) return null

        return this.getPreviousColumn().name
    }

    isNotForeignIndex(): boolean {
        return this.index && ! this.isForeign()
    }

    hasPreviousColumn(): boolean {
        return !! this.getPreviousColumn()
    }

    getPreviousColumn(): Column {
        return this.table.columns.find((column) => column.order === this.order - 1)
    }

    mustHaveOptions(): boolean {
        return this.isEnum() || this.isSet()
    }

    isEnum(): boolean {
        return this.type === 'enum'
    }

    isSet(): boolean {
        return this.type === 'set'
    }

    old(): Column {
        const oldColumn = new Column(this.schemaState)

        oldColumn.tableId = this.tableId

        return oldColumn
    }
    
    isFloatingPointNumber(): boolean {
        return ['decimal', 'double', 'float', 'unsignedDecimal'].includes(this.type)
    }

    isInvalid(): boolean {
        return ! this.isValid()
    }

    isValid(): boolean {
        return !! (this.name && this.type)
    }

    getDefaultFaker(): string {
        let defaultSettingsByName = this.getDefaultSettingsByName()

        if(defaultSettingsByName && defaultSettingsByName.faker != 'undefined') return defaultSettingsByName.faker

        return this.getFakerByType()
    }

    getDefaultInputType(): string {
        let defaultSettingsByName = this.getDefaultSettingsByName()

        if(defaultSettingsByName && typeof defaultSettingsByName.inputType !== 'undefined') return defaultSettingsByName.inputType

        return this.getInputTypeByColumnType() || 'text'
    }

    getInputTypeByColumnType(): string {
        let type = this.getType()

        if(type && type.inputType) return type.inputType
    }

    cannotGenerateDefaultInputByOptions(): boolean {
        return !this.canGenerateDefaultInputByOptions()
    }

    canGenerateDefaultInputByOptions(): boolean {
        let defaultSettingsByName = this.getDefaultSettingsByName() as any
    
        if(defaultSettingsByName && defaultSettingsByName.avoidInputGenerationByDefault) return false
    
        return true
    }

    generateDefaultOptions(): void {
        if(!this.mustHaveOptions()) return

        this.options = this.getDefaultOptions()
    }

    getDefaultForTemplate(): string {
        let type = this.getType()

        if(type.defaultValueTypeIsString) return `'${this.default}'`

        return this.default
    }

    getDefaultOptions(): string[] {
        let defaultSettingsByName = this.getDefaultSettingsByName()

        if(defaultSettingsByName && typeof defaultSettingsByName.inputOptions !== 'undefined') return defaultSettingsByName.inputOptions

        return []
    }

    getDefaultSettingsByName(name?: string): ColumnDefaultData {
        if(!name) name = this.name

        const defaultData = ColumnsDefaultDataList.getSettingsByColumnName(name)

        if(!defaultData) return null

        return defaultData
    }

    getFakerByType(): string {
        let type = this.getType()

        if(type && type.faker) return type.faker

        return 'fake()->word()'
    }

    getDefaultUniqueFaker() {
        let defaultFaker = this.getDefaultFaker()

        if(!defaultFaker) return ''

        return defaultFaker.replace('fake()->', 'fake()->unique->')
    }

    getType(): any {
        try {
            return ColumnTypeList.getByIdentifier(this.type)
        } catch {
            return null
        }
    }

    setDefaultSettingsByName() {
        const defaultColumnData = this.getDefaultSettingsByName()

        if(!defaultColumnData || this.type) return
        
        this.type = defaultColumnData.type

        if(defaultColumnData.length) this.length = defaultColumnData.length
        if(defaultColumnData.nullable) this.nullable = defaultColumnData.nullable
        if(defaultColumnData.faker) this.faker = defaultColumnData.faker

        this.generateDefaultOptions()
    }

    getFakerForTemplate() {
        let faker: string = this.faker,
            length = this.length || 255,
            defaultOrFirst: string = this.default || (this.options?.length ? this.options[0] : '')

        faker = faker.replace('{LENGTH}', String(length))
        faker = faker.replace('{DEFAULT_OR_FIRST}', defaultOrFirst)

        faker = faker.replace(/\$faker/g, '$this->faker').replace(/(Str::)/g, '\\Str::')

        return faker
    }

    logDataComparison() {
        console.log('Showing changes for column ' + this.name + ' on table ' + this.table.name)

        DataComparisonLogger.setInstance(this).log()
    }
    
    isUnsigned(): boolean {
        return !! this.unsigned
    }

    getForeignType(): string {
        const type = this.getType()

        return type.foreignType || this.type
    }

    isHiddenForCrudCreation(): boolean {
        if(this.name === 'password') return false

        if(this.cannotGenerateDefaultInputByOptions()) return true

        return false
    }
    
    referencesModel(model: Model): boolean {
        if(!this.isForeign()) return false;

        return this.relationshipsByForeignKey.some(relationship => relationship.relatedModelId === model.id)
    }
}
