import ColumnType from "./base/ColumnType"
import Project from "@Common/models/Project"

export default class Polygon extends ColumnType {
    static label: string = 'Polygon'
    static faker: string = '"{fake()->latitude()},{fake()->longitude()}"'
    static identifier: string = 'polygon'
    static inputType: string = 'text'
    static defaultValueTypeIsString: boolean = true

    static enabled(project: Project): boolean {
        if(!project || !project.id) return false
        
        return project.laravelVersionLessThan('11')
    }
}