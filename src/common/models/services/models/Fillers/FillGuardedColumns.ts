import Model from "@Common/models/Model"
import Column from "@Common/models/Column"

export default new class FillGuardedColumns {
    model: Model

    onModel(model: Model) {
        this.setModel(model)
        this.fill()
    }

    setModel(model: Model): FillGuardedColumns {
        this.model = model

        return this
    }

    fill() {
        this.model.guarded.forEach((columnName: string) => {
            const column: Column = this.model.table.findColumnByName(columnName)

            if(!column) return

            this.model.relation("guardedColumns").attachUnique(column)
        })
    }
}