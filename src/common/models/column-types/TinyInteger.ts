import ColumnType from "./base/ColumnType"

export default class TinyInteger extends ColumnType {
    static label: string = 'TinyInteger'
    static identifier: string = 'tinyInteger'
    static faker: string = 'fake()->numberBetween(0, 127)'
    static inputType: string = 'number'
    static defaultValueTypeIsString: boolean = false
    static isIncrementable: boolean = true
}