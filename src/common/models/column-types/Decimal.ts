import ColumnType from "./base/ColumnType"

export default class Decimal extends ColumnType {
    static label: string = 'Decimal'
    static identifier: string = 'decimal'
    static defaultValueTypeIsString: boolean = false
}