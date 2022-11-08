import Table from './Table'
import RelaDB from '@tiago_silva_pereira/reladb'
import TableColumnChanged from '../events/TableColumnChanged'
import TableColumnCreated from '../events/TableColumnCreated'

export default class Column extends RelaDB.Model {
    id: string
    name: string
    table: Table
    length: number
    tableId: string
    schemaState: any
    nullable: boolean
    unsigned: boolean
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

    static created(column: Column) {
        new TableColumnCreated(column).handle()
    }

    static updated(column: Column) {
        new TableColumnChanged(column).handle()
    }

    isForeign(): boolean {
        return this.name === 'user_id'
    }

    isUnique(): boolean {
        return this.name === 'password'
    }

    isSpecialPrimaryKey(): boolean {
        return false
    }

    hadChanges(comparisonData: any): boolean {
        if(!this.schemaState) return true 

        return this.name !== comparisonData.name ||
            this.length !== comparisonData.length ||
            this.nullable !== comparisonData.nullable ||
            this.typeDefinition !== comparisonData.type ||
            this.autoIncrement !== comparisonData.autoIncrement ||
            this.unsigned !== comparisonData.unsigned
    }

    applyChanges(data: any) {
        if(!this.hadChanges(data)) return

        this.name = data.name
        this.length = data.length
        this.nullable = data.nullable
        this.unsigned = data.unsigned
        this.typeDefinition = data.type
        this.autoIncrement = data.autoIncrement

        this.fillSchemaState()

        this.save()
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

    columnWasRenamed(): boolean {
        if(!this.schemaState) return false
        
        return this.schemaState.name !== this.name
    }
}
