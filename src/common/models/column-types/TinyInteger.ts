import ColumnType from "./base/ColumnType"

export default class TinyInteger extends ColumnType {
    static label: string = 'TinyInteger'
    static identifier: string = 'tinyInteger'
    static defaultValueTypeIsString: boolean = false
    static faker: string = '$faker->numberBetween(0, 127)'
}