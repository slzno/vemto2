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
    
    defaultTranslateName: string // Used to generate the translation key
    
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
        nav.defaultTranslateName = name
        nav.name = nav.generateTranslationForName()

        nav.save()

        return nav
    }

    static createFromProject(name: string, projectId: string): Nav {
        let nav = new Nav()
        nav.projectId = projectId
        nav.defaultTranslateName = name
        nav.name = nav.generateTranslationForName()

        nav.save()

        return nav
    }

    static deleting(nav: Nav) {
        nav.project.deleteTranslationOnAllLanguages(nav.getLangKeyForName())
    }

    generateTranslationForName(): string {
        const key = this.getLangKeyForName()

        this.project.setTranslationOnAllLanguages(key, this.defaultTranslateName)

        return key
    }

    getBaseLangKey(): string {
        if(this.parentNav) {
            const defaultParentNavName = this.project.getDefaultTranslation(this.parentNav.name)

            if(defaultParentNavName) {
                return `navigation.${changeCase.snakeCase(defaultParentNavName)}`
            }
        }

        return `navigation`
    }

    getLangKeyForName() {
        const name = changeCase.snakeCase(this.defaultTranslateName)

        return `${this.getBaseLangKey()}.${name}.name`
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