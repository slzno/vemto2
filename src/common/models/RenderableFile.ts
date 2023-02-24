import Model from './Model'
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
    error: string

    static identifier() {
        return 'RenderableFile'
    }

    relationships() {
        return {
            project: () => this.belongsTo(Project),
        }
    }

    regenerate() {
        this.status = RenderableFileStatus.PENDING
        this.save()
    }

    getDataWithDependencies() {
        let data = this.data

        if(data.model) data.model = Model.find(data.model)

        return data
    }

    static dataAsDependency(data: any) {
        return data.id ? data.id : data
    }
}