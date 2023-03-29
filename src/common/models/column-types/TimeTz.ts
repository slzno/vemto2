import ColumnType from "./base/ColumnType"

export default class TimeTz extends ColumnType {
    static label: string = 'TimeTz'
    static faker: string = "$faker->time('now', 'UTC')"
    static identifier: string = 'timeTz'
}