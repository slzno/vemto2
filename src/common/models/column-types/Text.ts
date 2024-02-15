import ColumnType from "./base/ColumnType"

export default class Text extends ColumnType {
    static label: string = 'Text'
    static hasLength: boolean = true
    static faker: string = 'fake()->text()'
    static identifier: string = 'text'
    static inputType: string = 'textarea'
    static defaultValueTypeIsString: boolean = true

    static validationRules: any[] = [
        'string',
    ]
}