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

    relationships() {
        return {
            project: () => this.belongsTo(Project),
            routable: () => this.morphTo("routable"),
            parentRoute: () => this.belongsTo(Route, "parentRouteId"),
            childrenRoutes: () => this.hasMany(Route, "parentRouteId"),
        }
    }
}