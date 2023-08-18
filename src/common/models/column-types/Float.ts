import ColumnType from "./base/ColumnType"

export default class Float extends ColumnType {
    static label: string = 'Float'
    static identifier: string = 'float'
    static faker: string = 'fake()->randomNumber(2)'
    static defaultValueTypeIsString: boolean = false
    static inputType: string = 'number'
}