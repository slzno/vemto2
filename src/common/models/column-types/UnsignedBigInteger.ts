import ColumnType from "./base/ColumnType"

export default class UnsignedBigInteger extends ColumnType {
    static label: string = 'UnsignedBigInteger'
    static identifier: string = 'unsignedBigInteger'
    static defaultValueTypeIsString: boolean = false
}