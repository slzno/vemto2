import ColumnType from "./base/ColumnType"

export default class MultiPoint extends ColumnType {
    static label: string = 'MultiPoint'
    static faker: string = '[]'
    static identifier: string = 'multiPoint'
}