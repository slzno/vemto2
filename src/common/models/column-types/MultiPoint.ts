import ColumnType from "./base/ColumnType"
import Project from "@Common/models/Project"

export default class MultiPoint extends ColumnType {
    static label: string = 'MultiPoint'
    static faker: string = '[]'
    static identifier: string = 'multiPoint'
    static inputType: string = 'text'
    static defaultValueTypeIsString: boolean = true

    static enabled(project: Project): boolean {
        if(!project || !project.id) return false
        
        return project.laravelVersionLessThan('11')
    }
}