import { paramCase } from 'change-case'
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
    routeBasePath: string
    requiresAuth: boolean

    relationships() {
        return {
            project: () => this.belongsTo(Project),
            cruds: () => this.hasMany(Crud, "sectionId").cascadeDelete(),
            pages: () => this.hasMany(Page, "sectionId").cascadeDelete(),
        }
    }

    needsRouteGroup(): boolean {
        return this.hasRoutePrefix() || this.requiresAuthentication()
    }

    hasRoutePrefix(): boolean {
        return !! this.routePrefix
    }

    requiresAuthentication(): boolean {
        return this.requiresAuth
    }
    
    getApplicationsCount(): number {
        return this.cruds.length + this.pages.length
    }

    getApplications(): any[] {
        return [...this.cruds, ...this.pages]
    }

    getFolderName(): string {
        return paramCase(this.name)
    }

    static findDefaultDashboardSection(): AppSection {
        return AppSection.findSectionByName('Dashboard')
            || AppSection.findFirstSectionWhichRequiresAuth()
    }

    static findDefaultSiteSection(): AppSection {
        return AppSection.findSectionByName('Site')
            || AppSection.findFirstSectionWhichDoesNotRequireAuth()
    }

    static findDefaultAdminSection(): AppSection {
        return AppSection.findSectionByName('Admin')
            || AppSection.findFirstSectionWhichDoesNotRequireAuth()
    }

    static findFirstSectionWhichRequiresAuth(): AppSection {
        return AppSection.get().filter(section => section.requiresAuth)[0]
    }

    static findFirstSectionWhichDoesNotRequireAuth(): AppSection {
        return AppSection.get().filter(section => ! section.requiresAuth)[0]
    }

    static findSectionByName(name: string): AppSection {
        return AppSection.get().filter(section => section.name === name)[0]
    }
}