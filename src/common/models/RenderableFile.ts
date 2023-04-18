import Model from './Model'
import Table from './Table'
import Index from './Index'
import Column from './Column'
import Crud from './crud/Crud'
import Project from './Project'
import Relationship from './Relationship'
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

export enum RenderableFileFormatter {
    NONE = 'none',
    PHP = 'php',
    HTML = 'html',
    BLADE = 'blade',
    JAVASCRIPT = 'javascript',
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
    formatter: string
    conflictFileName: string

    static identifier() {
        return 'RenderableFile'
    }

    static creating(renderableFile: any) {
        renderableFile.data = RenderableFile.addModelReferences(renderableFile.data)

        console.log(renderableFile)

        return renderableFile
    }

    static addModelReferences(data: any) {
        for(let key in data) {
            if(data[key] && data[key].__isRelaDBModel) {
                console.log(data[key])
                data[key] = `RelaDBModel:${data[key].constructor.identifier()}:${data[key].id}`
            }
        }

        return data
    }

    relationships() {
        return {
            project: () => this.belongsTo(Project),
        }
    }

    regenerate() {
        this.status = RenderableFileStatus.PENDING
        this.error = null
        this.save()
    }

    getRelativeFilePath(): string {
        return this.path + '/' + this.name
    }

    getDataWithDependencies() {
        let data = JSON.parse(JSON.stringify(this.data))

        for(let key in data) {
            if(data[key] && data[key].startsWith('RelaDBModel:')) {
                let [_, modelIdentifier, modelId] = data[key].split(':')

                data[key] = RenderableFile.resolveModelInstance(modelIdentifier, modelId)
            }
        }

        return data
    }

    static resolveModelInstance(modelIdentifier: string, modelId: string) {
        if(modelIdentifier == 'Model') return Model.find(modelId)
        if(modelIdentifier == 'Project') return Project.find(modelId)
        if(modelIdentifier == 'Column') return Column.find(modelId)
        if(modelIdentifier == 'Index') return Index.find(modelId)
        if(modelIdentifier == 'Relationship') return Relationship.find(modelId)
        if(modelIdentifier == 'Table') return Table.find(modelId)
        if(modelIdentifier == 'Crud') return Crud.find(modelId)

        throw new Error(`Model ${modelIdentifier} not found`)
    }
                

    static dataAsDependency(data: any) {
        return data.id ? data.id : data
    }
}