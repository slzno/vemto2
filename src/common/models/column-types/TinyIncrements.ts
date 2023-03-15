import ColumnType from "./base/ColumnType"

export default class TinyIncrements extends ColumnType {
    static label: string = 'TinyIncrements'
    static identifier: string = 'tinyIncrements'
    static defaultValueTypeIsString: boolean = false
}