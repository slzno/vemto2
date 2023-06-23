import Project from './Project'
import RelaDB from '@tiago_silva_pereira/reladb'

export default class AppSection extends RelaDB.Model {
    id: string
    name: string
    project: Project
    projectId: string
    routePrefix: string
    requiresAuth: boolean

    relationships() {
        return {
            project: () => this.belongsTo(Project),
        }
    }
}