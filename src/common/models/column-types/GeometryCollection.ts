import ColumnType from "./base/ColumnType"

export default class GeometryCollection extends ColumnType {
    static label: string = 'GeometryCollection'
    static faker: string = '["{$faker->latitude()},{$faker->longitude()}"]'
    static identifier: string = 'geometryCollection'
}