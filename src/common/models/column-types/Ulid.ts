import ColumnType from "./base/ColumnType"

export default class Ulid extends ColumnType {
    static label: string = 'Ulid'
    static faker: string = 'Str::ulid()'
    static identifier: string = 'ulid'
    static inputType: string = 'text'
    static defaultValueTypeIsString: boolean = true
}