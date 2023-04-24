import ColumnType from "./base/ColumnType"

export default class DateTime extends ColumnType {
    static label: string = 'DateTime'
    static faker: string = 'fake()->dateTime()'
    static identifier: string = 'dateTime'
}