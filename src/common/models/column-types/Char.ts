import ColumnType from "./base/ColumnType"

export default class Char extends ColumnType {
    static label: string = 'Char'
    static faker: string = '$faker->word({SIZE})'
    static identifier: string = 'char'
}