import ColumnType from "./base/ColumnType"

export default class Text extends ColumnType {
    static label: string = 'Text'
    static hasLength: boolean = true
    static faker: string = 'fake()->text()'
    static identifier: string = 'text'
    
    static input: any = {
        type: "textarea"
    }

    static validationRules: any[] = [
        'string',
    ]
}