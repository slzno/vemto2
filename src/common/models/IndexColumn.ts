import Index from "./Index"
import Column from "./Column"
import RelaDB from "@tiago_silva_pereira/reladb"

export default class IndexColumn extends RelaDB.Model {
    columnId: string
    column: Column

    indexId: string
    index: Index

    relationships() {
        return {
            column: () => this.belongsTo(Column),
            index: () => this.belongsTo(Index)
        }
    }
}