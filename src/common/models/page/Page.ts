import { v4 as uuid } from "uuid"
import Route, { RouteType } from "@Common/models/Route"
import { camelCase, capitalCase, paramCase, pascalCase } from "change-case"
import Project from "@Common/models/Project"
import RelaDB from "@tiago_silva_pereira/reladb"
import HeaderOneComponent from "./components/HeaderOneComponent"
import Component from "./components/interfaces/Component"
import ParagraphComponent from "./components/ParagraphComponent"


export default class Page extends RelaDB.Model {
    id: string
    name: string
    project: Project
    projectId: string
    routes: Route[]
    section: string
    namespace: string
    components: any[]

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
        page.section = 'root'
        page.namespace = `App\\Http\\Livewire\\Pages\\${pascalCase(page.name)}`
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

        this.components.push(component)

        this.save()
    }

    removeComponent(component: any) {
        this.components = this.components.filter((c: any) => c.id !== component.id)

        this.save()
    }

    getComponents(): Component[] {
        return this.components.map((component: any) => {
            const componentType = this.getComponentTypeMap()[component.type]

            if (!componentType) {
                throw new Error(`Component type ${component.type} not found`)
            }

            return new componentType(component)
        })
    }

    getComponentTypeMap(): any {
        return {
            'HeaderOne': HeaderOneComponent,
            'Paragraph': ParagraphComponent,
        }
    }
}
