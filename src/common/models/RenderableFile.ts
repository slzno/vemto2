import path from 'path'
import Model from './Model'
import Project from './Project'
import RelaDB from '@tiago_silva_pereira/reladb'

export enum RenderableFileType {
    PHP_CLASS = 'php-class',
    HTML = 'html',
    PHP = 'php',
    JS = 'js',
    CSS = 'css',
    SCSS = 'scss',
    JSON = 'json',
    ENV = 'env',
}

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
    type: RenderableFileType

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

    getRelativeFilePath(): string {
        return this.path + '/' + this.name
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