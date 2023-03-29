import ColumnType from "./base/ColumnType"

export default class UnsignedTinyInteger extends ColumnType {
    static label: string = 'UnsignedTinyInteger'
    static identifier: string = 'unsignedTinyInteger'
    static faker: string = '$faker->numberBetween(0, 127)'
    static defaultValueTypeIsString: boolean = false
}