import Table from './Table'
import RelaDB from '@tiago_silva_pereira/reladb'

export default class Column extends RelaDB.Model {
    id: string
    name: string
    table: Table
    length: number
    tableId: string
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

    hadChanges(comparisonData: any): boolean {
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

        this.save()
    }

    isForeign(): boolean {
        return this.name === 'user_id'
    }

    isUnique(): boolean {
        return this.name === 'password'
    }
}
