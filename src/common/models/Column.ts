import Table from './Table'
import RelaDB from '@tiago_silva_pereira/reladb'
import TableColumnChanged from '@Common/events/TableColumnChanged'
import TableColumnCreated from '@Common/events/TableColumnCreated'

export default class Column extends RelaDB.Model {
    id: string
    name: string
    table: Table
    order: number
    length: number
    tableId: string
    schemaState: any
    nullable: boolean
    unsigned: boolean
    removed: boolean
    autoIncrement: boolean
    typeDefinition: string

    static identifier() {
        return 'Column'
    }

    relationships() {
        return {
            table: () => this.belongsTo(Table),
        }
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
        this.removed = true

        this.save()
    }

    getOldName(): string {
        if(!this.schemaState) return this.name

        return this.schemaState.name
    }

    isPrimaryKey(): boolean {
        return this.name === 'id'
    }

    isForeign(): boolean {
        return this.name === 'user_id'
    }

    isUnique(): boolean {
        return this.name === 'password'
    }

    isSpecialPrimaryKey(): boolean {
        return this.name === 'special_primary_key'
    }

    hadChanges(comparisonData: any): boolean {
        if(!this.schemaState) return true 

        return this.schemaState.name !== comparisonData.name ||
            this.schemaState.length !== comparisonData.length ||
            this.schemaState.nullable !== comparisonData.nullable ||
            this.schemaState.typeDefinition !== comparisonData.type ||
            this.schemaState.autoIncrement !== comparisonData.autoIncrement ||
            this.schemaState.unsigned !== comparisonData.unsigned || 
            this.schemaState.order !== comparisonData.order
    }

    applyChanges(data: any): boolean {
        if(!this.hadChanges(data)) return false

        this.name = data.name
        this.order = data.order
        this.length = data.length
        this.nullable = data.nullable
        this.unsigned = data.unsigned
        this.typeDefinition = data.type
        this.autoIncrement = data.autoIncrement

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
            typeDefinition: this.typeDefinition,
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

    hasChanges(): boolean {
        if(!this.schemaState) return false

        return this.schemaState.name !== this.name ||
            this.schemaState.length !== this.length ||
            this.schemaState.nullable !== this.nullable ||
            this.schemaState.unsigned !== this.unsigned ||
            this.schemaState.autoIncrement !== this.autoIncrement ||
            this.schemaState.typeDefinition !== this.typeDefinition
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
}
