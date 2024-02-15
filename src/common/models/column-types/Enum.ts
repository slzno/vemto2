import ColumnType from "./base/ColumnType"

export default class Enum extends ColumnType {
    static label: string = 'Enum'
    static identifier: string = 'enum'
    static faker: string = "'{DEFAULT_OR_FIRST}'"
    static inputType: string = 'select'
    static defaultValueTypeIsString: boolean = true
}