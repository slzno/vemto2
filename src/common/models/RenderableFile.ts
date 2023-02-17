import Project from './Project'
import RelaDB from '@tiago_silva_pereira/reladb'

export enum RenderableFileStatus {
    PENDING = 'pending',
    RENDERING = 'rendering',
    RENDERED = 'rendered',
    ERROR = 'error',
    CONFLICT = 'conflict',
}

export default class RenderableFile extends RelaDB.Model {
    id: string
    path: string
    name: string
    template: string
    data: any
    status: RenderableFileStatus
    project: Project
    projectId: string

    static identifier() {
        return 'RenderableFile'
    }

    relationships() {
        return {
            project: () => this.belongsTo(Project),
        }
    }
}