import ColumnType from "./base/ColumnType"

export default class Time extends ColumnType {
    static label: string = 'Time'
    static faker: string = '$faker->time()'
    static identifier: string = 'time'
}