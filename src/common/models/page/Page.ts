import { v4 as uuid } from "uuid"
import Route, { RouteType } from "@Common/models/Route"
import { camelCase, capitalCase, paramCase, pascalCase } from "change-case"
import Project from "@Common/models/Project"
import RelaDB from "@tiago_silva_pereira/reladb"
import HeaderOneComponent from "./components/HeaderOneComponent"
import Component from "./components/interfaces/Component"
import ParagraphComponent from "./components/ParagraphComponent"
import SmallComponent from "./components/SmallComponent"
import ForelseComponent from "./components/ForelseComponent"
import CustomComponent from "./components/CustomComponent"
import AppSection from "../AppSection"


export default class Page extends RelaDB.Model {
    id: string
    name: string
    project: Project
    projectId: string
    routes: Route[]
    section: AppSection
    sectionId: string
    namespace: string
    components: any[]
    livewireComponentName: string

    relationships() {
        return {
            project: () => this.belongsTo(Project),
            section: () => this.belongsTo(AppSection, "sectionId"),
            routes: () => this.morphMany(Route, "routable").cascadeDelete(),
        }
    }

    static creating(data: any): any {
        data.projectId = 1

        return data
    }

    static createFromData(data: any) {
        const page = new Page(),
            defaultSection = AppSection.findDefaultSiteSection()

        page.name = data.name
        page.sectionId = defaultSection ? defaultSection.id : null
        page.namespace = `App\\Http\\Livewire\\Pages`
        page.livewireComponentName = pascalCase(data.name)
        page.components = []

        page.save()

        page.addRoute(data.route)
    }

    getLabel(): string {
        return this.name
    }

    getAppType(): string {
        return 'Page'
    }

    addRoute(defaultRoutePath: string) {
        const path = defaultRoutePath || Page.calculateDefaultRoutePath(this.name)

        Route.create({
            name: `${paramCase(this.name)}.index`,
            tag: "index",
            method: "get",
            type: RouteType.ROUTE,
            path: path,
            routableId: this.id,
            routableType: "Page",
            projectId: this.projectId,
        })
    }

    static calculateDefaultRoutePath(name: string): string {
        return `/pages/${paramCase(name)}`
    }

    getRouteContent(): string {
        return `${this.namespace}\\${this.livewireComponentName}::class`
    }

    addComponent(component: any) {
        component.id = uuid()

        const componentHandler = this.getComponentHandler(component)

        component.settings = componentHandler.getSettingsAsKeyValue()

        this.components.push(component)

        this.save()
    }

    removeComponent(component: any) {
        this.components = this.components.filter((c: any) => c.id !== component.id)

        this.save()
    }

    updateComponent(component: any) {
        const index = this.components.findIndex((c: any) => c.id === component.id)

        this.components[index] = component

        this.save()
    }

    getComponents(): Component[] {
        return this.components.map((component: any) => {
            return this.getComponentHandler(component)
        })
    }

    getComponentHandler(component: any): any {
        const componentHandler = this.getComponentHandlerMap()[component.type]

        if (!componentHandler) {
            throw new Error(`Component type ${component.type} not found`)
        }

        return new componentHandler(component)
    }

    saveComponentsOrder(components: any[]) {
        this.components = components

        this.save()
    }

    getInjectableModelsByRoute(route: Route): any[] {
        const models = this.project.models,
            mainRoute = this.routes[0]

        if(!mainRoute) return []

        // get all parameters from the route.path
        const routeParameters = mainRoute.path.match(/{(.*?)}/g)

        if(!routeParameters) return []

        // get the route parameters names
        const routeParametersNames = routeParameters.map((parameter: string) => {
            return parameter.replace('{', '').replace('}', '')
        })

        // return all the models that are being used in the route
        return models.filter((model: any) => {
            return routeParametersNames.some((parameterName: string) => {
                return parameterName === camelCase(model.name)
            })
        })
    }

    getModelCollections(): any[] {
        const models = this.project.models
        
        const allComponentsContentSettings = this.getComponents().map((component: any) => {
            if(component.settings.content) {
                return component.settings.content
            }

            return ''
        })

        // return all the models that are being used in the content
        return models.filter((model: any) => {
            return allComponentsContentSettings.some((content: string) => {
                const collectionVarName = `$${camelCase(model.plural)}`

                return content.includes(collectionVarName)
            })
        })
    }

    getComponentHandlerMap(): any {
        return {
            'HeaderOne': HeaderOneComponent,
            'Paragraph': ParagraphComponent,
            'Small': SmallComponent,
            'Forelse': ForelseComponent,
            'Custom': CustomComponent,
        }
    }
}
