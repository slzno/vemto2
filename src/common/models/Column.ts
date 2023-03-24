import Table from './Table'
import RelaDB from '@tiago_silva_pereira/reladb'
import TableColumnChanged from '@Common/events/TableColumnChanged'
import TableColumnCreated from '@Common/events/TableColumnCreated'
import ColumnData from './data/ColumnData'
import ColumnsDefaultData from './column-types/default/ColumnsDefaultData'
import ColumnsDefaultDataInterface from './column-types/default/base/ColumnsDefaultDataInterface'
import ColumnTypeList from './column-types/base/ColumnTypeList'
import ColumnType from './column-types/base/ColumnType'

export default class Column extends RelaDB.Model {
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
        const orderWasChanged = this.schemaState.order !== schemaData.order

        return this.hasDataChanges(schemaData) || orderWasChanged
    }

    hasDataChanges(comparisonData: any): boolean {
        return this.schemaState.name !== comparisonData.name 
            || this.schemaState.type !== comparisonData.type
            || this.schemaState.length !== comparisonData.length
            || this.schemaState.nullable !== comparisonData.nullable
            || this.schemaState.autoIncrement !== comparisonData.autoIncrement
            || this.schemaState.unsigned !== comparisonData.unsigned
            || this.schemaState.index !== comparisonData.index
            || this.schemaState.unique !== comparisonData.unique
            || this.schemaState.default !== comparisonData.default
            || this.schemaState.total !== comparisonData.total
            || this.schemaState.places !== comparisonData.places
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
            places: this.places,
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
        let defaultTypeSettingsByName = this.getDefaultTypeSettingsByName()

        if(defaultTypeSettingsByName && defaultTypeSettingsByName.faker != undefined) return defaultTypeSettingsByName.faker

        return this.getFakerByType()
    }

    getDefaultTypeSettingsByName(name?: string): ColumnsDefaultDataInterface {
        if(!name) name = this.name

        const defaultTypeData = ColumnsDefaultData.getSettingsByColumnName(name)

        if(!defaultTypeData) return null

        return defaultTypeData
    }

    getFakerByType(): string {
        let type = this.getType()

        if(type && type.faker) return type.faker

        return '$faker->word()'
    }

    getDefaultUniqueFaker() {
        let defaultFaker = this.getDefaultFaker()

        return defaultFaker.replace('$faker->', '$faker->unique->')
    }

    hasFaker() {
        return this.getType() && this.getType().faker.length
    }

    getType(): any {
        return ColumnTypeList.getByIdentifier(this.type)
    }

    isInvalid(): boolean {
        return ! this.isValid()
    }
}
