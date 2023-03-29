import ColumnType from "./base/ColumnType"

export default class ForeignId extends ColumnType {
    static label: string = 'ForeignId'
    static identifier: string = 'foreignId'
    static faker: string = '$faker->randomNumber()'
    static defaultValueTypeIsString: boolean = false
}