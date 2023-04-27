import ColumnType from "./base/ColumnType"

export default class MacAddress extends ColumnType {
    static label: string = 'MacAddress'
    static identifier: string = 'macAddress'
    static faker: string = 'fake()->macAddress()'
}