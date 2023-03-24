import ColumnType from "./base/ColumnType"

export default class SmallInteger extends ColumnType {
    static label: string = 'SmallInteger'
    static identifier: string = 'smallInteger'
    static faker: string = '$faker->numberBetween(0, 32767)'
    static defaultValueTypeIsString: boolean = false
}