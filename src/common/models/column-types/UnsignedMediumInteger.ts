import ColumnType from "./base/ColumnType"

export default class UnsignedMediumInteger extends ColumnType {
    static label: string = 'UnsignedMediumInteger'
    static identifier: string = 'unsignedMediumInteger'
    static faker: string = 'fake()->numberBetween(0, 8388607)'
    static defaultValueTypeIsString: boolean = false
    static inputType: string = 'number'
}