import ColumnType from "./base/ColumnType"

export default class Binary extends ColumnType {
    static label: string = 'Binary'
    static identifier: string = 'binary'
    static defaultValueTypeIsString: boolean = false
}