import ColumnType from "./base/ColumnType"
import Project from "@Common/models/Project"

export default class LineString extends ColumnType {
    static label: string = 'LineString'
    static identifier: string = 'lineString'
    static faker: string = 'fake()->text()'
    static inputType: string = 'text'
    static defaultValueTypeIsString: boolean = true

    static enabled(project: Project): boolean {
        if(!project || !project.id) return false
        
        return project.laravelVersionLessThan('11')
    }
}