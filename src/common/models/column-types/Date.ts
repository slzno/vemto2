import ColumnType from "./base/ColumnType"

export default class Date extends ColumnType {
    static label: string = 'Date'
    static faker: string = '$faker->date()'
    static identifier: string = 'date'
}