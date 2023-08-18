import ColumnType from "./base/ColumnType"

export default class Jsonb extends ColumnType {
    static label: string = 'Jsonb'
    static identifier: string = 'jsonb'
    static faker: string = '[]'
    static inputType: string = 'textarea'
}