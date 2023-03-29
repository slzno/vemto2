import ColumnType from "./base/ColumnType"

export default class Increments extends ColumnType {
    static label: string = 'Increments'
    static identifier: string = 'increments'
    static defaultValueTypeIsString: boolean = false
}