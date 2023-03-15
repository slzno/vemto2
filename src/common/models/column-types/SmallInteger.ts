import ColumnType from "./base/ColumnType"

export default class SmallInteger extends ColumnType {
    static label: string = 'SmallInteger'
    static identifier: string = 'smallInteger'
    static defaultValueTypeIsString: boolean = false
}