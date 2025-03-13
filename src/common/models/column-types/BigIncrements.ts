import ColumnType from "./base/ColumnType"

export default class BigIncrements extends ColumnType {
    static label: string = 'BigIncrements (PK)'
    static identifier: string = 'bigIncrements'
    static defaultValueTypeIsString: boolean = false
    static isPrimaryKey: boolean = true
    static foreignType: string = 'unsignedBigInteger'
    static inputType: string = 'number'
    static isIncrementable: boolean = true
}