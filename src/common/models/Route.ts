import { paramCase } from 'change-case'
import Project from './Project'
import RelaDB from '@tiago_silva_pereira/reladb'

export enum RouteType {
    ROUTE = "route",
    RESOURCE = "resource",
    MIDDLEWARE = "middleware",
    GROUP = "group",
}

export default class Route extends RelaDB.Model {
    id: string
    tag: string
    routableId: string
    routableType: string
    type: RouteType
    routable: any
    name: string
    path: string
    order: number
    method: string
    project: Project
    projectId: string
    parentRouteId: string
    parentRoute: Route
    hasCustomContent: boolean
    customContent: string

    relationships() {
        return {
            project: () => this.belongsTo(Project),
            routable: () => this.morphTo("routable"),
            parentRoute: () => this.belongsTo(Route, "parentRouteId"),
            childrenRoutes: () => this.hasMany(Route, "parentRouteId"),
        }
    }

    getLaravelMethod(): string {
        return this.method
    }

    getContent(): string {
        if(this.hasCustomContent) return this.customContent

        return this.routable.getRouteContent(this)
    }

    routableIs(otherRoutable: any): boolean {
        if(!otherRoutable) return false

        return this.routableId === otherRoutable.id && this.routableType === otherRoutable.constructor.identifier()
    }

    getName() {
        if(this.routable.section) {
            return `${paramCase(this.routable.section)}.${this.name}`
        }

        return this.name
    }
}