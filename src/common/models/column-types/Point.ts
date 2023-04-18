import ColumnType from "./base/ColumnType"

export default class Point extends ColumnType {
    static label: string = 'Point'
    static faker: string = '"{fake()->latitude()},{fake()->longitude()}"'
    static identifier: string = 'point'
}