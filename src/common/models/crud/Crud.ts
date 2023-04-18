import CrudPanel from './CrudPanel'
import Model from '@Common/models/Model'
import Project from '@Common/models/Project'
import RelaDB from '@tiago_silva_pereira/reladb'

export enum CrudType {
    DEFAULT = 'Default',
    VUE = 'Vue',
    LIVEWIRE = 'Livewire',
}

export default class Crud extends RelaDB.Model {
    id: string
    name: string
    type: CrudType
    model: Model
    modelId: string
    project: Project
    projectId: string
    panels: CrudPanel[]

    static identifier() {
        return 'Crud'
    }

    relationships() {
        return {
            model: () => this.belongsTo(Model),
            project: () => this.belongsTo(Project),
            panels: () => this.hasMany(CrudPanel),
        }
    }
}
