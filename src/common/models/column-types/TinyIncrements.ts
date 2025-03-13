import ColumnType from "./base/ColumnType"

export default class TinyIncrements extends ColumnType {
    static label: string = 'TinyIncrements (PK)'
    static identifier: string = 'tinyIncrements'
    static isPrimaryKey: boolean = true
    static foreignType: string = 'unsignedTinyInteger'
    static defaultValueTypeIsString: boolean = false
    static inputType: string = 'number'
}