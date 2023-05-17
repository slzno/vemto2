import RelaDB from '@tiago_silva_pereira/reladb'

export enum RouteType {
    ROUTE = "route",
    MIDDLEWARE = "middleware",
    GROUP = "group",
}

export default class Route extends RelaDB.Model {
    id: string
    routableId: string
    routableType: string
    routable: any
    name: string
    path: string
    order: number
    parentRouteId: string
    parentRoute: Route

    static identifier() {
        return "Route"
    }

    relationships() {
        return {
            routable: () => this.morphTo("routableId", "routableType"),
            parentRoute: () => this.belongsTo(Route, "parentRouteId"),
            childrenRoutes: () => this.hasMany(Route, "parentRouteId"),
        }
    }
}