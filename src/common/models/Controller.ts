import Model from './Model'
import Project from './Project'
import RelaDB from '@tiago_silva_pereira/reladb'
import { RenderableFileType } from './RenderableFile'

export default class Controller extends RelaDB.Model {
    id: string
    name: string
    namespace: string
    model: Model
    modelId: string
    project: Project
    projectId: string

    static identifier() {
        return 'Controller'
    }

    static created(controller: Controller) {
        controller.syncSourceCode()
    }

    relationships() {
        return {
            model: () => this.belongsTo(Model),
            project: () => this.belongsTo(Project),
        }
    }

    static getNameFromModel(model: Model) {
        return model.name + 'Controller'
    }

    getFileName() {
        return this.name + '.php'
    }

    syncSourceCode() {
        this.project.registerRenderableFile(
            'app/Http/Controllers', 
            this.getFileName(),
            'controllers/Controller.vemtl', 
            {
                controller: this,
            },
            RenderableFileType.PHP
        )
    }
}
