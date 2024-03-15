import ColumnType from "./base/ColumnType"
import Project from "@Common/models/Project"

export default class MultiPolygonZ extends ColumnType {
    static label: string = 'MultiPolygonZ'
    static faker: string = '[]'
    static identifier: string = 'multiPolygonZ'
    static inputType: string = 'text'
    static defaultValueTypeIsString: boolean = true

    static enabled(project: Project): boolean {
        if(!project || !project.id) return false
        
        return project.laravelVersionLessThan('11')
    }
}