import ColumnType from "./base/ColumnType"

export default class SmallInteger extends ColumnType {
    static label: string = 'SmallInteger'
    static identifier: string = 'smallInteger'
    static faker: string = 'fake()->numberBetween(0, 32767)'
    static defaultValueTypeIsString: boolean = false
    static inputType: string = 'number'
    static isIncrementable: boolean = true
}