import ColumnType from "./base/ColumnType"

export default class String extends ColumnType {
    static label: string = 'String'
    static faker: string = '$faker->text({LENGTH})'
    static identifier: string = 'string'
}