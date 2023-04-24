import ColumnType from "./base/ColumnType"

export default class MediumInteger extends ColumnType {
    static label: string = 'MediumInteger'
    static identifier: string = 'mediumInteger'
    static faker: string = 'fake()->numberBetween(0, 8388607)'
    static defaultValueTypeIsString: boolean = false
}