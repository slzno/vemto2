import ColumnType from "./base/ColumnType"

export default class Polygon extends ColumnType {
    static label: string = 'Polygon'
    static faker: string = '"{fake()->latitude()},{fake()->longitude()}"'
    static identifier: string = 'polygon'
    static inputType: string = 'text'
    static defaultValueTypeIsString: boolean = true
}