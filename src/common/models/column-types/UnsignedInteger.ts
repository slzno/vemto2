import ColumnType from "./base/ColumnType"

export default class UnsignedInteger extends ColumnType {
    static label: string = 'UnsignedInteger'
    static identifier: string = 'unsignedInteger'
    static faker: string = '$faker->randomNumber()'
    static defaultValueTypeIsString: boolean = false
}