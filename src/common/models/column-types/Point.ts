import ColumnType from "./base/ColumnType"

export default class Point extends ColumnType {
    static label: string = 'Point'
    static faker: string = '"{$faker->latitude()},{$faker->longitude()}"'
    static identifier: string = 'point'
}