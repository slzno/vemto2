import Column from "../models/Column";

export default class TableColumnChanged {

    column: Column

    constructor(column: Column) {
        this.column = column
    }

    handle() {
        console.log(this.column.name)
    }

}