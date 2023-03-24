import ColumnType from "./base/ColumnType"

export default class Set extends ColumnType {
    static label: string = 'Set'
    static identifier: string = 'set'
    static faker: string = "'{DEFAULT_OR_FIRST}'"
}