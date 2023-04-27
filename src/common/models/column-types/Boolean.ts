import ColumnType from "./base/ColumnType"

export default class Boolean extends ColumnType {
    static label: string = 'Boolean'
    static identifier: string = 'boolean'
    static faker: string = 'fake()->boolean()'
    static defaultValueTypeIsString: boolean = false
}