import Table from './Table'
import RelaDB from '@tiago_silva_pereira/reladb'
import TableColumnChanged from '@Common/events/TableColumnChanged'
import TableColumnCreated from '@Common/events/TableColumnCreated'
import ColumnData from './data/ColumnData'
import ColumnsDefaultData from './column-types/default/ColumnsDefaultData'
import ColumnsDefaultDataInterface from './column-types/default/base/ColumnsDefaultDataInterface'
import ColumnTypeList from './column-types/base/ColumnTypeList'
import DataComparisonLogger from './services/DataComparisonLogger'
import DataComparator from './services/DataComparator'

export default class Column extends RelaDB.Model implements SchemaModel {
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

    constructor(data: any = {}) {
        const columnData = Object.assign(ColumnData.getDefault(), data)

        super(columnData)
    }

    static identifier() {
        return 'Column'
    }

    relationships() {
        return {
            table: () => this.belongsTo(Table),
        }
    }

    static created(column: Column) {
        let nextOrder = 0
        
        const tableColumns = column.table.getOrderedColumns()

        if(tableColumns.length > 0) {
            nextOrder = tableColumns[tableColumns.length - 1].order + 1
        }

        column.faker = column.getDefaultFaker()

        column.order = nextOrder
        column.saveFromInterface()
    }

    static updated(column: Column) {
        column.syncSourceCode()
    }

    saveFromInterface() {
        let creating = false

        if(!this.isSaved()) creating = true

        this.save()

        if(creating) {
            new TableColumnCreated(this).handle()
        } else {
            new TableColumnChanged(this).handle()
        }

        return this
    }

    remove() {
        if(this.isNew()) {
            return this.delete()
        }
        
        this.removed = true

        this.save()
    }

    getOldName(): string {
        if(!this.schemaState) return this.name

        return this.schemaState.name
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
        
        return foreignIndexes.some(index => index.columns.includes(this.name))
    }

    isUnique(): boolean {
        return this.isImplicitlyUnique()
    }

    isImplicitlyUnique(): boolean {
        return !! this.unique
    }

    isSpecialPrimaryKey(): boolean {
        return this.type === 'uuid'
    }

    hasFaker(): boolean {
        return !! this.faker
    }

    hasImplicitIndex(): boolean {
        return !! this.index
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

    getAfter(): string {
        if(!this.hasPreviousColumn()) return null

        return this.getPreviousColumn().name
    }

    hasPreviousColumn(): boolean {
        return !! this.getPreviousColumn()
    }

    getPreviousColumn(): Column {
        return this.table.columns.find((column) => column.order === this.order - 1)
    }

    old(): Column {
        const oldColumn = new Column(this.schemaState)

        oldColumn.tableId = this.tableId

        return oldColumn
    }
    
    isFloatingPointNumber(): boolean {
        return ['decimal', 'double', 'float', 'unsignedDecimal'].includes(this.type)
    }

    isValid(): boolean {
        return !! (this.name && this.type)
    }

    getDefaultFaker(): string {
        let defaultSettingsByName = this.getDefaultSettingsByName()

        if(defaultSettingsByName && defaultSettingsByName.faker != 'undefined') return defaultSettingsByName.faker

        return this.getFakerByType()
    }

    getDefaultSettingsByName(name?: string): ColumnsDefaultDataInterface {
        if(!name) name = this.name

        const defaultData = ColumnsDefaultData.getSettingsByColumnName(name)

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
        return ColumnTypeList.getByIdentifier(this.type)
    }

    isInvalid(): boolean {
        return ! this.isValid()
    }

    setDefaultSettingsByName() {
        const defaultColumnData = this.getDefaultSettingsByName()

        if(!defaultColumnData || this.type) return
        
        this.type = defaultColumnData.type

        if(defaultColumnData.length) this.length = defaultColumnData.length
        if(defaultColumnData.nullable) this.nullable = defaultColumnData.nullable
        if(defaultColumnData.faker) this.faker = defaultColumnData.faker
    }

    getFakerForTemplate() {
        let faker: string = this.faker,
            length = this.length || 255,
            defaultOrFirst: string = this.default

        faker = faker.replace('{LENGTH}', String(length))
        faker = faker.replace('{DEFAULT_OR_FIRST}', defaultOrFirst)

        faker = faker.replace(/\$faker/g, '$this->faker').replace(/(Str::)/g, '\\Str::')

        return faker
    }

    syncSourceCode() {
        this.table.syncSourceCode()
    }

    logDataComparison() {
        console.log('Showing changes for column ' + this.name + ' on table ' + this.table.name)

        DataComparisonLogger.setInstance(this).log()
    }
}
