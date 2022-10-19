import Table from './Table'
import RelaDB from '@tiago_silva_pereira/reladb'

export default class Column extends RelaDB.Model {
    id: string
    name: string
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

    isForeign(): boolean {
        return false
    }

    isUnique(): boolean {
        return false
    }
}
