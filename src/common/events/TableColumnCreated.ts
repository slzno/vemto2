import Column from "../models/Column";

export default class TableColumnCreated {

    column: Column

    constructor(column: Column) {
        this.column = column
    }

    handle() {
        this.column.table.markAsChanged()
    }

}