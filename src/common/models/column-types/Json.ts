import ColumnType from "./base/ColumnType"

export default class Json extends ColumnType {
    static label: string = 'Json'
    static identifier: string = 'json'
    static faker: string = '[]'
    static inputType: string = 'textarea'
    static defaultValueTypeIsString: boolean = true
}