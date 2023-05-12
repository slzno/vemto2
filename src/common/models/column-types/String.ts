import ColumnType from "./base/ColumnType"

export default class String extends ColumnType {
    static label: string = 'String'
    static hasLength: boolean = true
    static faker: string = 'fake()->text({LENGTH})'
    static identifier: string = 'string'

    static input: any = {
        type: "textarea"
    }

    static validationRules: any[] = [
        'string',
    ]
}