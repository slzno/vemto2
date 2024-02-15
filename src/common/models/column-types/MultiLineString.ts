import ColumnType from "./base/ColumnType"

export default class MultiLineString extends ColumnType {
    static label: string = 'MultiLineString'
    static faker: string = 'fake()->text()'
    static identifier: string = 'multiLineString'
    static inputType: string = 'textarea'
    static defaultValueTypeIsString: boolean = true
}