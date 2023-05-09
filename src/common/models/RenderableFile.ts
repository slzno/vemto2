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

export enum RenderableFileFormatter {
    NONE = 'none',
    PHP = 'php',
    HTML = 'html',
    BLADE = 'blade',
    JAVASCRIPT = 'javascript',
}

export enum RenderableFileStatus {
    PREPARING = 'preparing',
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
    status: RenderableFileStatus
    project: Project
    projectId: string
    error: string
    hasTemplateError: boolean
    templateErrorLine: number
    type: RenderableFileType
    formatter: string
    conflictFileName: string
    content: string

    static identifier() {
        return 'RenderableFile'
    }

    relationships() {
        return {
            project: () => this.belongsTo(Project),
        }
    }

    setContent(content: string) {
        this.content = content

        this.status = RenderableFileStatus.PENDING

        this.save()

        return this
    }

    setError(error: string) {
        this.error = error

        this.status = RenderableFileStatus.ERROR

        this.save()

        return this
    }

    getRelativeFilePath(): string {
        return this.path + '/' + this.name
    }
}