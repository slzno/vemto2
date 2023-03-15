import ColumnType from "./base/ColumnType"

export default class Double extends ColumnType {
    static label: string = 'Double'
    static identifier: string = 'double'
    static defaultValueTypeIsString: boolean = false
}