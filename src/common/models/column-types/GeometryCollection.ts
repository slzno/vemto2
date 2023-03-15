import ColumnType from "./base/ColumnType"

export default class GeometryCollection extends ColumnType {
    static label: string = 'GeometryCollection'
    static identifier: string = 'geometryCollection'
}