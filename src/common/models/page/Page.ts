import { v4 as uuid } from "uuid"
import Route, { RouteType } from "@Common/models/Route"
import { camelCase, paramCase, pascalCase } from "change-case"
import Project from "@Common/models/Project"
import RelaDB from "@tiago_silva_pereira/reladb"
import Component from "./components/interfaces/Component"
import AppSection from "../AppSection"
import ComponentHelper from "./components/services/ComponentHelper"

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
        page.livewireComponentName = `${pascalCase(data.name)}Page`
        page.components = []

        page.save()

        page.addRoute(data.route)
    }

    getLabel(): string {
        return this.name
    }

    getAppSubType(): string {
        return this.getAppType()
    }

    getAppType(): string {
        return "Page"
    }

    addRoute(defaultRoutePath: string) {
        const path =
            defaultRoutePath || Page.calculateDefaultRoutePath(this.name)

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

        const componentHandler = ComponentHelper.getComponentHandler(component)

        component.settings = componentHandler.getSettingsAsKeyValue()
        component.location = "components"

        this.components.push(component)

        this.save()
    }

    updateComponent(component: any) {
        const index = this.components.findIndex(
            (c: any) => c.id === component.id
        )

        this.components[index] = component

        this.save()
    }

    moveComponent(movementData: any) {
        const movedComponent = this.getComponent(movementData.componentId), 
            fromComponent = this.getComponent(movementData.from),
            toComponent = this.getComponent(movementData.to),
            oldIndex = movementData.oldIndex,
            newIndex = movementData.newIndex

        if (!movedComponent) return
        if (!fromComponent) return
        if (!toComponent) return

        // Remove component from old position
        fromComponent[movedComponent.location].splice(oldIndex, 1)

        // Add component to new position
        movedComponent.location = movementData.parentKey

        if(!toComponent[movementData.parentKey]) {
            toComponent[movementData.parentKey] = []
        }

        toComponent[movementData.parentKey].splice(
            newIndex,
            0,
            movedComponent
        )

        this.components = JSON.parse(JSON.stringify(this.components))

        this.save()
    }

    getComponent(componentId: string): any {
        if (componentId === "page") return this

        const components = this.components

        // Define recursive search function
        const searchComponents = (components: any[]): any => {
            for (let component of components) {
                const componentHandler = ComponentHelper.getComponentHandler(component)

                if (component.id == componentId) {
                    return component
                } else if (componentHandler.hasNestedComponents()) {
                    let nestedComponentsKeys = componentHandler.getNestedComponentsKeys()

                    for (let key of nestedComponentsKeys) {
                        // Check if component has array of nested components
                        if (Array.isArray(component[key])) {
                            let result = searchComponents(component[key])
                            // If the component was found in the nested components, return it
                            if (result) return result
                        }
                    }
                }
            }
            // Return null if component is not found
            return null
        }

        // Start searching
        return searchComponents(components)
    }

    getComponents(): Component[] {
        return this.components.map((component: any) => {
            return ComponentHelper.getComponentHandler(component)
        })
    }

    removeComponent(component: Component): void {
        const componentId = component.id

        // Define recursive remove function
        const removeComponents = (components: any[]): any => {
            for (let i = 0; i < components.length; i++) {
                const component = components[i];
                const componentHandler = ComponentHelper.getComponentHandler(component)

                if (component.id == componentId) {
                    // Remove the component from the array and return
                    components.splice(i, 1);
                    return;
                } else if (componentHandler.hasNestedComponents()) {
                    let nestedComponentsKeys = componentHandler.getNestedComponentsKeys()
    
                    for (let key of nestedComponentsKeys) {
                        // Check if component has array of nested components
                        if (Array.isArray(component[key])) {
                            removeComponents(component[key]);
                        }
                    }
                }
            }
        }
    
        // Start removing
        removeComponents(this.components)
    
        this.save()
    }

    saveComponentsOrder(components: any[]) {
        this.components = components

        this.save()
    }

    getInjectableModelsByRoute(route: Route): any[] {
        const models = this.project.models,
            mainRoute = this.routes[0]

        if (!mainRoute) return []

        // get all parameters from the route.path
        const routeParameters = mainRoute.path.match(/{(.*?)}/g)

        if (!routeParameters) return []

        // get the route parameters names
        const routeParametersNames = routeParameters.map(
            (parameter: string) => {
                return parameter.replace("{", "").replace("}", "")
            }
        )

        // return all the models that are being used in the route
        return models.filter((model: any) => {
            return routeParametersNames.some((parameterName: string) => {
                return parameterName === camelCase(model.name)
            })
        })
    }

    getModelCollections(): any[] {
        const models = this.project.models

        const allComponentsContentSettings = this.getComponents().map(
            (component: any) => {
                if (component.settings.content) {
                    return component.settings.content
                }

                return ""
            }
        )

        // return all the models that are being used in the content
        return models.filter((model: any) => {
            return allComponentsContentSettings.some((content: string) => {
                const collectionVarName = `$${camelCase(model.plural)}`

                return content.includes(collectionVarName)
            })
        })
    }

    
}
