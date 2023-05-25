import Route, { RouteType } from "@Common/models/Route"
import { camelCase, capitalCase, paramCase, pascalCase } from "change-case"
import Project from "@Common/models/Project"
import RelaDB from "@tiago_silva_pereira/reladb"


export default class Page extends RelaDB.Model {
    id: string
    name: string
    project: Project
    projectId: string
    routes: Route[]

    relationships() {
        return {
            project: () => this.belongsTo(Project),
            routes: () => this.morphMany(Route, "routable").cascadeDelete(),
        }
    }

    // static createFromModel(model: Model) {
    //     const crud = new Crud()

    //     crud.save()
    // }

    getLabel(): string {
        return this.name
    }

    addRoutes() {
        Route.create({
            name: `${paramCase(this.name)}.index`,
            tag: "index",
            method: "get",
            type: RouteType.ROUTE,
            path: `/${paramCase(this.name)}`,
            routableId: this.id,
            routableType: "Crud",
            projectId: this.projectId,
        })
    }

    getRouteContent(route: Route): string {
        return ''
    }
}
