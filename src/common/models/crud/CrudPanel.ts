import Crud from "./Crud"
import Input from "./Input"
import RelaDB from "@tiago_silva_pereira/reladb"

export default class CrudPanel extends RelaDB.Model {
    id: string
    title: string
    crud: Crud
    crudId: string
    order: number
    inputs: Input[]

    relationships() {
        return {
            crud: () => this.belongsTo(Crud),
            inputs: () => this.hasMany(Input, "panelId").cascadeDelete(),
        }
    }

    getOrderedInputs(): Input[] {
        return this.inputs.sort((a, b) => a.order - b.order)
    }
}
