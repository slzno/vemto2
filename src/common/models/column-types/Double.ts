import ColumnType from "./base/ColumnType"

export default class Double extends ColumnType {
    static label: string = 'Double'
    static identifier: string = 'double'
    static faker: string = '$faker->randomNumber(2)'
    static defaultValueTypeIsString: boolean = false
}