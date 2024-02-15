import ColumnType from "./base/ColumnType"

export default class Year extends ColumnType {
    static label: string = 'Year'
    static identifier: string = 'year'
    static faker: string = 'fake()->year()'
    static inputType: string = 'text'
    static defaultValueTypeIsString: boolean = false
}