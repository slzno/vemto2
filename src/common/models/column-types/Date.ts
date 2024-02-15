import ColumnType from "./base/ColumnType"

export default class Date extends ColumnType {
    static label: string = 'Date'
    static faker: string = 'fake()->date()'
    static identifier: string = 'date'
    static inputType: string = 'date'
    static defaultValueTypeIsString: boolean = true
}