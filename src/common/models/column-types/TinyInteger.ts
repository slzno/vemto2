import ColumnType from "./base/ColumnType"

export default class TinyInteger extends ColumnType {
    static label: string = 'TinyInteger'
    static identifier: string = 'tinyInteger'
    static defaultValueTypeIsString: boolean = false
}