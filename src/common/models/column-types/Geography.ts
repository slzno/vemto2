import ColumnType from "./base/ColumnType"
import Project from "@Common/models/Project"

export default class Geography extends ColumnType {
    static label: string = 'Geography'
    static faker: string = '"{fake()->latitude()},{fake()->longitude()}"'
    static identifier: string = 'geography'
    static inputType: string = 'textarea'
    static defaultValueTypeIsString: boolean = true

    static enabled(project: Project): boolean {
        if(!project || !project.id) return false
        
        return project.laravelVersionGreaterThanOrEqualTo('11')
    }
}