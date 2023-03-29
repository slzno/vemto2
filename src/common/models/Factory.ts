import Model from './Model'
import Project from './Project'
import RelaDB from '@tiago_silva_pereira/reladb'
import RenderableFile, { RenderableFileType } from './RenderableFile'

export default class Factory extends RelaDB.Model {
    id: string
    name: string
    namespace: string
    model: Model
    modelId: string
    project: Project
    projectId: string

    static identifier() {
        return 'Factory'
    }

    static created(factory: Factory) {
        factory.syncSourceCode()
    }

    relationships() {
        return {
            model: () => this.belongsTo(Model),
            project: () => this.belongsTo(Project),
        }
    }

    static getNameFromModel(model: Model) {
        return model.name + 'Factory'
    }

    getFileName() {
        return this.name + '.php'
    }

    syncSourceCode() {
        this.project.registerRenderableFile(
            'database/factories', 
            this.getFileName(),
            'database/Factory.vemtl', 
            {
                factory: RenderableFile.dataAsDependency(this),
            },
            RenderableFileType.PHP
        )
    }
}
