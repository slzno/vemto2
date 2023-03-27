import ColumnType from "./base/ColumnType"

export default class Polygon extends ColumnType {
    static label: string = 'Polygon'
    static faker: string = '"{$faker->latitude()},{$faker->longitude()}"'
    static identifier: string = 'polygon'
}