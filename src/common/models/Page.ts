import Project from './Project'
import RelaDB from '@tiago_silva_pereira/reladb'
import { RenderableFileType } from './RenderableFile'

export default class Page extends RelaDB.Model {
    id: string
    name: string
    project: Project
    projectId: string

    static identifier() {
        return 'Page'
    }

    static created(page: Page) {
        page.syncSourceCode()
    }

    relationships() {
        return {
            project: () => this.belongsTo(Project),
        }
    }

    getFileName() {
        return this.name + '.blade.php'
    }

    syncSourceCode() {
        this.project.registerRenderableFile(
            'app/Http/Pages', 
            this.getFileName(),
            'pages/Page.vemtl', 
            {
                page: this,
            },
            RenderableFileType.PHP
        )
    }
}
