import ColumnType from "./base/ColumnType"

export default class GeometryCollection extends ColumnType {
    static label: string = 'GeometryCollection'
    static faker: string = '["{fake()->latitude()},{fake()->longitude()}"]'
    static identifier: string = 'geometryCollection'
    static inputType: string = 'textarea'
    static defaultValueTypeIsString: boolean = true
}