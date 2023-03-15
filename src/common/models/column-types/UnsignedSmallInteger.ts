import ColumnType from "./base/ColumnType"

export default class UnsignedSmallInteger extends ColumnType {
    static label: string = 'UnsignedSmallInteger'
    static identifier: string = 'unsignedSmallInteger'
    static defaultValueTypeIsString: boolean = false
}