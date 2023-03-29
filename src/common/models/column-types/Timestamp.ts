import ColumnType from "./base/ColumnType"

export default class Timestamp extends ColumnType {
    static label: string = 'Timestamp'
    static identifier: string = 'timestamp'
    static faker: string = '$faker->dateTime()'
    static defaultValueTypeIsString: boolean = false
}