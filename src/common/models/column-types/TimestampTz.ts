import ColumnType from "./base/ColumnType"

export default class TimestampTz extends ColumnType {
    static label: string = 'TimestampTz'
    static faker: string = "$faker->dateTime('now', 'UTC')"
    static identifier: string = 'timestampTz'
}