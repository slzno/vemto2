import ColumnType from "./base/ColumnType"

export default class UnsignedInteger extends ColumnType {
    static label: string = 'UnsignedInteger'
    static identifier: string = 'unsignedInteger'
    static defaultValueTypeIsString: boolean = false
}