import ColumnType from "./base/ColumnType"

export default class LongText extends ColumnType {
    static label: string = 'LongText'
    static identifier: string = 'longText'
    static faker: string = 'fake()->text()'
}