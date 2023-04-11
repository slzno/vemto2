import Controller from './Controller'
import Model from './Model'
import Page from './Page'
import Project from './Project'
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
    controller: Controller
    controllerId: string
    indexPage: Page
    indexPageId: string
    viewPage: Page
    viewPageId: string

    static identifier() {
        return 'Crud'
    }

    relationships() {
        return {
            model: () => this.belongsTo(Model),
            project: () => this.belongsTo(Project),
            controller: () => this.belongsTo(Controller),
            indexPage: () => this.belongsTo(Page, 'indexPageId'),
        }
    }
}
