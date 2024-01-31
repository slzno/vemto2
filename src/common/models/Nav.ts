import Project from './Project'
import * as changeCase from "change-case"
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
    navigable: any
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

    static createFromNavigable(
        name: string,
        projectId: string,
        navigableId: string,
        navigableType: string,
    ): Nav {
        let nav = new Nav()
        nav.projectId = projectId
        nav.navigableType = navigableType
        nav.navigableId = navigableId
        nav.name = name

        nav.generateTranslationForName()
        nav.save()

        return nav
    }

    static createFromProject(name: string, projectId: string): Nav {
        let nav = new Nav()
        nav.projectId = projectId
        nav.name = name

        nav.generateTranslationForName()
        nav.save()

        return nav
    }

    static deleting(nav: Nav) {
        nav.project.deleteTranslationOnAllLanguages(nav.getLangKeyForName())
    }

    static updating(data: any) {
        data.generateTranslationForName(data.project.getDefaultTranslation(data.name))
    }

    generateTranslationForName(defaultName: string = '') {
        if(!defaultName.length) defaultName = this.name

        const key = this.getLangKeyForName(defaultName)

        this.project.setTranslationOnAllLanguages(key, defaultName)

        this.name = key
    }

    getLangKeyForName(defaultName: string = '') {
        if(!defaultName.length) defaultName = this.name

        const navKey = this.getBaseLangKey()

        return `${navKey}.${changeCase.snakeCase(defaultName)}`
    }

    getBaseLangKey(): string {
        if(this.isRoot() || !this.parentNav || !this.parentNav.getModel()) {
            return 'navigation'
        }

        return `navigation.${changeCase.snakeCase(this.parentNav.getModel().name)}`
    }

    isRoot(): boolean {
        return ! this.parentNavId
    }

    hasCustomLink(): boolean {
        return !! this.customLink
    }

    getCustomLink(): string {
        return this.customLink
    }

    getModel() {
        if(this.navigableType === "Crud") {
            return this.navigable.model
        }

        if(this.navigableType === "Page") {
            return this.navigable.section.crud.model
        }

        return null
    }
}