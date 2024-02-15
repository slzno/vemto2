import ColumnType from "./base/ColumnType"

export default class Uuid extends ColumnType {
    static label: string = 'Uuid'
    static faker: string = 'fake()->uuid()'
    static identifier: string = 'uuid'
    static inputType: string = 'text'
    static defaultValueTypeIsString: boolean = true
}