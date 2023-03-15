import ColumnType from "./base/ColumnType"

export default class UnsignedMediumInteger extends ColumnType {
    static label: string = 'UnsignedMediumInteger'
    static identifier: string = 'unsignedMediumInteger'
    static defaultValueTypeIsString: boolean = false
}