import ColumnType from "./base/ColumnType"

export default class Geometry extends ColumnType {
    static label: string = 'Geometry'
    static faker: string = '"{$faker->latitude()},{$faker->longitude()}"'
    static identifier: string = 'geometry'
}