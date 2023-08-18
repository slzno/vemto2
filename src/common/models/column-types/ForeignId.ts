import ColumnType from "./base/ColumnType"

export default class ForeignId extends ColumnType {
    static label: string = 'ForeignId'
    static identifier: string = 'foreignId'
    static faker: string = 'fake()->randomNumber()'
    static defaultValueTypeIsString: boolean = false
    static inputType: string = 'number'
}