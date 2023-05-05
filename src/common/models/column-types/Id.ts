import ColumnType from "./base/ColumnType"

export default class Id extends ColumnType {
    static label: string = 'ID (PK)'
    static identifier: string = 'id'
    static isPrimaryKey: boolean = true
    static foreignType: string = 'unsignedBigInteger'
    static defaultValueTypeIsString: boolean = false
}