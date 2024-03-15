import Project from "@Common/models/Project"

export default class ColumnType {
    static help: string = ''
    static label: string = ''
    static faker: string = ''
    static identifier: string = ''
    static foreignType: string = ''
    static isPrimaryKey: boolean = false
    static defaultValueTypeIsString: boolean = true
    static inputType: string = 'text'

    static enabled(project?: Project): boolean {
        return !! project.id
    }
}