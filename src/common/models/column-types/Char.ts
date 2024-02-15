import ColumnType from "./base/ColumnType"

export default class Char extends ColumnType {
    static label: string = 'Char'
    static faker: string = 'fake()->word({LENGTH})'
    static identifier: string = 'char'
    static inputType: string = 'text'
    static defaultValueTypeIsString: boolean = true
}