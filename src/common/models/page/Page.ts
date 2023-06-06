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


export default class Page extends RelaDB.Model {
    id: string
    name: string
    project: Project
    projectId: string
    routes: Route[]
    section: string
    namespace: string
    components: any[]
    livewireComponentName: string

    relationships() {
        return {
            project: () => this.belongsTo(Project),
            routes: () => this.morphMany(Route, "routable").cascadeDelete(),
        }
    }

    static creating(data: any): any {
        data.projectId = 1

        return data
    }

    static createFromData(data: any) {
        const page = new Page()

        page.name = data.name
        page.section = 'site'
        page.namespace = `App\\Http\\Livewire\\Pages`
        page.livewireComponentName = pascalCase(data.name)
        page.components = []

        page.save()

        page.addRoutes()
    }

    getLabel(): string {
        return this.name
    }

    getAppType(): string {
        return 'Page'
    }

    addRoutes() {
        Route.create({
            name: `${paramCase(this.name)}.index`,
            tag: "index",
            method: "get",
            type: RouteType.ROUTE,
            path: `/pages/${paramCase(this.name)}`,
            routableId: this.id,
            routableType: "Page",
            projectId: this.projectId,
        })
    }

    getRouteContent(route: Route): string {
        return ''
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

    getComponentHandlerMap(): any {
        return {
            'HeaderOne': HeaderOneComponent,
            'Paragraph': ParagraphComponent,
            'Small': SmallComponent,
            'Forelse': ForelseComponent,
        }
    }

    saveComponentsOrder(components: any[]) {
        this.components = components

        this.save()
    }
}
