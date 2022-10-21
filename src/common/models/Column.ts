import Table from './Table'
import RelaDB from '@tiago_silva_pereira/reladb'

export default class Column extends RelaDB.Model {
    id: string
    name: string
    table: Table
    length: number
    tableId: string
    nullable: boolean
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
            this.typeDefinition !== comparisonData.type
    }

    applyChanges(data: any) {
        if(!this.hadChanges(data)) return
        
        this.name = data.name
        this.typeDefinition = data.type
        this.save()
    }

    isForeign(): boolean {
        return false
    }

    isUnique(): boolean {
        return false
    }
}
