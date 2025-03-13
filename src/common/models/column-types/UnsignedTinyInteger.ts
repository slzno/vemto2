import ColumnType from "./base/ColumnType"

export default class UnsignedTinyInteger extends ColumnType {
    static label: string = 'UnsignedTinyInteger'
    static identifier: string = 'unsignedTinyInteger'
    static faker: string = 'fake()->numberBetween(0, 127)'
    static defaultValueTypeIsString: boolean = false
    static inputType: string = 'number'
    static isIncrementable: boolean = true
}