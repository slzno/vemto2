import ColumnType from "./base/ColumnType"

export default class BigInteger extends ColumnType {
    static label: string = 'BigInteger'
    static identifier: string = 'bigInteger'
    static faker: string = 'fake()->randomNumber()'
    static defaultValueTypeIsString: boolean = false
    static inputType: string = 'number'
}