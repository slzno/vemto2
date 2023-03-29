import ColumnType from "./base/ColumnType"

export default class Uuid extends ColumnType {
    static label: string = 'Uuid'
    static faker: string = '$faker->uuid()'
    static identifier: string = 'uuid'
}