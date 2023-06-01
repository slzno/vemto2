import Model from "@Common/models/Model"
import Column from "@Common/models/Column"

export default new class FillFillableColumns {
    model: Model

    onModel(model: Model) {
        this.setModel(model)
        this.fill()
    }

    setModel(model: Model): FillFillableColumns {
        this.model = model

        return this
    }

    fill() {
        this.model.fillable.forEach((columnName: string) => {
            const column: Column = this.model.table.findColumnByName(columnName)

            if(!column) return

            this.model.relation("fillableColumns").attachUnique(column)
        })
    }
}