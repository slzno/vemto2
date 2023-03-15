import ColumnType from "./base/ColumnType"

export default class MediumInteger extends ColumnType {
    static label: string = 'MediumInteger'
    static identifier: string = 'mediumInteger'
    static defaultValueTypeIsString: boolean = false
}