import ColumnType from "./base/ColumnType"

export default class MediumText extends ColumnType {
    static label: string = 'MediumText'
    static faker: string = '$faker->text()'
    static identifier: string = 'mediumText'
}