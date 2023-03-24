import ColumnType from "./base/ColumnType"

export default class MultiPolygon extends ColumnType {
    static label: string = 'MultiPolygon'
    static faker: string = '[]'
    static identifier: string = 'multiPolygon'
}