import ColumnType from "./base/ColumnType"

export default class String extends ColumnType {
    static label: string = 'String'
    static faker: string = '$faker->text({SIZE})'
    static identifier: string = 'string'
}