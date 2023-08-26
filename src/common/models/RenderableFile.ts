import Project from './Project'
import RelaDB from '@tiago_silva_pereira/reladb'

export enum RenderableFileType {
    PHP_CLASS = 'php-class',
    HTML = 'html',
    PHP = 'php',
    BLADE = 'blade',
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
    ASK_TO_REMOVE = 'to-be-removed',
    CAN_REMOVE = 'can-remove',
    REMOVED = 'removed',
}

export default class RenderableFile extends RelaDB.Model {
    id: string
    path: string
    name: string
    fullPath: string
    template: string
    status: RenderableFileStatus
    project: Project
    projectId: string
    error: string
    errorStack: string
    hasTemplateError: boolean
    templateErrorLine: number
    type: RenderableFileType
    formatter: string
    conflictFileName: string
    content: string
    notRemovable: boolean

    relationships() {
        return {
            project: () => this.belongsTo(Project),
        }
    }

    isRemovable(): boolean {
        return !this.notRemovable
    }

    canBeRemoved(): boolean {
        return this.status === RenderableFileStatus.CAN_REMOVE
    }

    setContent(content: string) {
        this.content = content

        this.status = RenderableFileStatus.PENDING

        this.save()

        return this
    }

    setError(error: string, stack: string = null) {
        this.error = error
        this.errorStack = stack.toString()

        this.status = RenderableFileStatus.ERROR

        this.save()

        return this
    }

    getRelativeFilePath(): string {
        return this.path + '/' + this.name
    }

    setAsNotRemovable() {
        this.notRemovable = true

        this.save()
    }

    setAsRemovable() {
        this.notRemovable = false

        this.save()
    }

    askToRemove() {
        this.status = RenderableFileStatus.ASK_TO_REMOVE

        this.save()
    }

    markToRemove() {
        this.status = RenderableFileStatus.CAN_REMOVE

        this.save()
    }

    wasRemoved() {
        return this.status === RenderableFileStatus.REMOVED
    }

    hasConflict() {
        return this.status === RenderableFileStatus.CONFLICT
    }
}