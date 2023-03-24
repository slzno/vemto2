import ColumnType from "./base/ColumnType"

export default class UnsignedBigInteger extends ColumnType {
    static label: string = 'UnsignedBigInteger'
    static identifier: string = 'unsignedBigInteger'
    static faker: string = '$faker->randomNumber()'
    static defaultValueTypeIsString: boolean = false
}