import ColumnType from "./base/ColumnType"

export default class MediumText extends ColumnType {
    static label: string = 'MediumText'
    static faker: string = 'fake()->text()'
    static identifier: string = 'mediumText'
}