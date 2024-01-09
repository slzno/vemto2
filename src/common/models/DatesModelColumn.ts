import Model from "./Model"
import Column from "./Column"
import RelaDB from "@tiago_silva_pereira/reladb"

export default class DatesModelColumn extends RelaDB.Model {
    columnId: string
    column: Column

    modelId: string
    model: Model

    relationships() {
        return {
            column: () => this.belongsTo(Column),
            model: () => this.belongsTo(Model)
        }
    }
}