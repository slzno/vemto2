import ColumnType from "./base/ColumnType"

export default class SmallIncrements extends ColumnType {
    static label: string = 'SmallIncrements (PK)'
    static identifier: string = 'smallIncrements'
    static isPrimaryKey: boolean = true
    static foreignType: string = 'unsignedSmallInteger'
    static defaultValueTypeIsString: boolean = false
    static inputType: string = 'number'
}