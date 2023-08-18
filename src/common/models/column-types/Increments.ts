import ColumnType from "./base/ColumnType"

export default class Increments extends ColumnType {
    static label: string = 'Increments (PK)'
    static identifier: string = 'increments'
    static defaultValueTypeIsString: boolean = false
    static isPrimaryKey: boolean = true
    static foreignType: string = 'unsignedInteger'
    static inputType: string = 'number'
}