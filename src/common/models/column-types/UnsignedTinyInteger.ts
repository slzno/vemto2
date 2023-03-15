import ColumnType from "./base/ColumnType"

export default class UnsignedTinyInteger extends ColumnType {
    static label: string = 'UnsignedTinyInteger'
    static identifier: string = 'unsignedTinyInteger'
    static defaultValueTypeIsString: boolean = false
}