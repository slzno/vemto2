import ColumnType from "./base/ColumnType"
import Project from "@Common/models/Project"

export default class GeometryCollection extends ColumnType {
    static label: string = 'GeometryCollection'
    static faker: string = '["{fake()->latitude()},{fake()->longitude()}"]'
    static identifier: string = 'geometryCollection'
    static inputType: string = 'textarea'
    static defaultValueTypeIsString: boolean = true

    static enabled(project: Project): boolean {
        if(!project || !project.id) return false
        
        return project.laravelVersionLessThan('11')
    }
}