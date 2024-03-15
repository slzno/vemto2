import ColumnType from "./base/ColumnType"
import Project from "@Common/models/Project"

export default class MultiPolygon extends ColumnType {
    static label: string = 'MultiPolygon'
    static faker: string = '[]'
    static identifier: string = 'multiPolygon'
    static inputType: string = 'text'
    static defaultValueTypeIsString: boolean = true

    static enabled(project: Project): boolean {
        if(!project || !project.id) return false
        
        return project.laravelVersionLessThan('11')
    }
}