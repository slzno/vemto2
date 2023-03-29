import ColumnType from "./base/ColumnType"

export default class Char extends ColumnType {
    static label: string = 'Char'
    static faker: string = '$faker->word({LENGTH})'
    static identifier: string = 'char'
}