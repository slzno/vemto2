import ColumnType from "./base/ColumnType"

export default class MediumIncrements extends ColumnType {
    static label: string = 'MediumIncrements'
    static identifier: string = 'mediumIncrements'
    static defaultValueTypeIsString: boolean = false
}