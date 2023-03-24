import ColumnType from "./base/ColumnType"

export default class Integer extends ColumnType {
    static label: string = 'Integer'
    static identifier: string = 'integer'
    static faker: string = '$faker->randomNumber(0)'
    static defaultValueTypeIsString: boolean = false
}