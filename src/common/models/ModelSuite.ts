import Model from './Model'
import Factory from './Factory'
import Project from './Project'
import RelaDB from '@tiago_silva_pereira/reladb'

export default class ModelSuite extends RelaDB.Model {
    id: string
    name: string
    model: Model
    modelId: string
    project: Project
    projectId: string
    factory: Factory
    factoryId: string

    static identifier() {
        return 'ModelSuite'
    }

    relationships() {
        return {
            model: () => this.belongsTo(Model),
            project: () => this.belongsTo(Project),
            factory: () => this.belongsTo(Factory),
        }
    }
}
