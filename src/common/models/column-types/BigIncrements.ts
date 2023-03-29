import ColumnType from "./base/ColumnType"

export default class BigIncrements extends ColumnType {
    static label: string = 'BigIncrements'
    static identifier: string = 'bigIncrements'
    static defaultValueTypeIsString: boolean = false
}