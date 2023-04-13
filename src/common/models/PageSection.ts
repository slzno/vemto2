import Page from './Page'
import RelaDB from '@tiago_silva_pereira/reladb'
import { RenderableFileType } from './RenderableFile'

export default class PageSection extends RelaDB.Model {
    id: string
    name: string
    page: Page
    pageId: string

    static identifier() {
        return 'PageSection'
    }

    static created(pageSection: PageSection) {
        pageSection.syncSourceCode()
    }

    relationships() {
        return {
            page: () => this.belongsTo(Page),
        }
    }

    getFileName() {
        return this.name + '.php'
    }

    syncSourceCode() {
        const project = this.page.project
        
        project.registerRenderableFile(
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
