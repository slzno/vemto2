import ColumnType from "./base/ColumnType"

export default class SmallIncrements extends ColumnType {
    static label: string = 'SmallIncrements'
    static identifier: string = 'smallIncrements'
    static defaultValueTypeIsString: boolean = false
}