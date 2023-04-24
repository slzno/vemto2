import ColumnType from "./base/ColumnType"

export default class UnsignedSmallInteger extends ColumnType {
    static label: string = 'UnsignedSmallInteger'
    static identifier: string = 'unsignedSmallInteger'
    static faker: string = 'fake()->numberBetween(0, 32767)'
    static defaultValueTypeIsString: boolean = false
}