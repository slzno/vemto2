import ColumnType from "./base/ColumnType"

export default class DateTimeTz extends ColumnType {
    static label: string = 'DateTimeTz'
    static faker: string = "$faker->boolean('now', 'UTC')"
    static identifier: string = 'dateTimeTz'
}