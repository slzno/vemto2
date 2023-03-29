import ColumnType from "./base/ColumnType"

export default class MultiLineString extends ColumnType {
    static label: string = 'MultiLineString'
    static faker: string = '$faker->text()'
    static identifier: string = 'multiLineString'
}