import ColumnType from "./base/ColumnType"

export default class UnsignedDecimal extends ColumnType {
    static label: string = 'UnsignedDecimal'
    static identifier: string = 'unsignedDecimal'
    static defaultValueTypeIsString: boolean = false
}