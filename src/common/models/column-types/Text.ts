import ColumnType from "./base/ColumnType"

export default class Text extends ColumnType {
    static label: string = 'Text'
    static faker: string = '$faker->text()'
    static identifier: string = 'text'
}