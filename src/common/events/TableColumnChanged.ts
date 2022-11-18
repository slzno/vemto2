import Column from "@Common/models/Column";

export default class TableColumnChanged {

    column: Column

    constructor(column: Column) {
        this.column = column
    }

    handle() {
        this.column.table.markAsChanged()
    }

}