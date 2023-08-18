import ColumnType from "./base/ColumnType"

export default class IpAddress extends ColumnType {
    static label: string = 'IpAddress'
    static identifier: string = 'ipAddress'
    static faker: string = 'fake()->ipv4()'
    static inputType: string = 'text'
}