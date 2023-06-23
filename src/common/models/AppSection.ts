import Crud from './crud/Crud'
import Page from './page/Page'
import Project from './Project'
import RelaDB from '@tiago_silva_pereira/reladb'

export default class AppSection extends RelaDB.Model {
    id: string
    name: string
    cruds: Crud[]
    pages: Page[]
    project: Project
    projectId: string
    routePrefix: string
    requiresAuth: boolean

    relationships() {
        return {
            project: () => this.belongsTo(Project),
            cruds: () => this.hasMany(Crud, "sectionId").cascadeDelete(),
            pages: () => this.hasMany(Page, "sectionId").cascadeDelete(),
        }
    }

    getApplicationsCount(): number {
        return this.cruds.length + this.pages.length
    }

    static findDefaultAdminSection(): AppSection {
        return AppSection.get().filter(section => section.name === 'Admin')[0]
            || AppSection.findFirstSectionWhichRequiresAuth()
    }

    static findDefaultSiteSection(): AppSection {
        return AppSection.get().filter(section => section.name === 'Site')[0]
            || AppSection.findFirstSectionWhichDoesNotRequireAuth()
    }

    static findFirstSectionWhichRequiresAuth(): AppSection {
        return AppSection.get().filter(section => section.requiresAuth)[0]
    }

    static findFirstSectionWhichDoesNotRequireAuth(): AppSection {
        return AppSection.get().filter(section => ! section.requiresAuth)[0]
    }
}