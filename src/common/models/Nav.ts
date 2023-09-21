import Project from './Project'
import RelaDB from '@tiago_silva_pereira/reladb'

export default class Nav extends RelaDB.Model {
    id: string
    name: string
    navigableId: string
    navigableType: string
    project: Project
    projectId: string
    parentNav: Nav
    parentNavId: string
    children: Nav[]
    tag: string
    customLink: string
    isCustom: boolean

    relationships() {
        return {
            project: () => this.belongsTo(Project),
            navigable: () => this.morphTo("navigable"),
            parentNav: () => this.belongsTo(Nav, "parentNavId"),
            children: () => this.hasMany(Nav, "parentNavId").cascadeDelete(),
        }
    }

    static findByTag(tag: string): Nav {
        return Nav.get().filter((nav: Nav) => nav.tag === tag)[0]
    }

    isRoot(): boolean {
        return true
    }

    hasCustomLink(): boolean {
        return !! this.customLink
    }

    getCustomLink(): string {
        return this.customLink
    }
}