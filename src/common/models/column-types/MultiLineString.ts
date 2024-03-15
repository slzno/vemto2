import ColumnType from "./base/ColumnType"
import Project from "@Common/models/Project"

export default class MultiLineString extends ColumnType {
    static label: string = 'MultiLineString'
    static faker: string = 'fake()->text()'
    static identifier: string = 'multiLineString'
    static inputType: string = 'textarea'
    static defaultValueTypeIsString: boolean = true

    static enabled(project: Project): boolean {
        if(!project || !project.id) return false

        return project.laravelVersionLessThan('11')
    }
}