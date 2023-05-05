import ColumnType from "./base/ColumnType"

export default class MediumIncrements extends ColumnType {
    static label: string = 'MediumIncrements (PK)'
    static identifier: string = 'mediumIncrements'
    static defaultValueTypeIsString: boolean = false
    static isPrimaryKey: boolean = true
    static foreignType: string = 'unsignedMediumInteger'
}