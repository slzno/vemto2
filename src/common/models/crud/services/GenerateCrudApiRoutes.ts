import Route, { RouteType } from "@Common/models/Route";
import Crud from "../Crud";
import { camelCase, paramCase } from "change-case";

export default class GenerateCrudApiRoutes {
    crud: Crud

    constructor(crud: Crud) {
        this.crud = crud
    }

    generate() {
        this.generateCrudRoutes()
        this.generateCrudRelationshipRoutes()
    }

    getRoutePath(...paths: string[]) {
        return `${this.crud.getBaseRoutePath()}/${paths.join("/")}`
    }

    generateCrudRoutes() {
        const crudModelName = camelCase(this.crud.model.name)

        this.createRoute("index", "get", this.getRoutePath(), this.crud.id, "Crud")
        this.createRoute("store", "post", this.getRoutePath(), this.crud.id, "Crud")
        this.createRoute("show", "get", this.getRoutePath(`{${crudModelName}}`), this.crud.id, "Crud")
        this.createRoute("update", "put", this.getRoutePath(`{${crudModelName}}`), this.crud.id, "Crud")
        this.createRoute("destroy", "delete", this.getRoutePath(`{${crudModelName}}`), this.crud.id, "Crud")
    }

    generateCrudRelationshipRoutes() {
        this.crud.hasManyDetails.forEach(detail => {
            const detailCrudModelPlural = paramCase(detail.detailCrud.model.plural),
                detailCrudModelName = camelCase(detail.detailCrud.model.name)

            const indexStoreRoutePath = this.getRoutePath(detailCrudModelPlural, `{${detailCrudModelName}}`)

            this.createRoute("index", "get", indexStoreRoutePath, detail.id, "HasManyDetail")
            this.createRoute("store", "post", indexStoreRoutePath, detail.id, "HasManyDetail")
        })

        this.crud.belongsToManyDetails.forEach(detail => {
            const detailCrudModelName = camelCase(detail.crud.model.name),
                detailRelatedCrudModelPlural = paramCase(detail.detailCrud.model.plural),
                detailRelatedCrudModelName = camelCase(detail.detailCrud.model.name)

            const indexRoutePath = this.getRoutePath(`{${detailCrudModelName}}`, detailRelatedCrudModelPlural),
                storeDestroyRoutePath = this.getRoutePath(`{${detailCrudModelName}}`, detailRelatedCrudModelPlural, `{${detailRelatedCrudModelName}}`)

            this.createRoute("index", "get", indexRoutePath, detail.id, "BelonsToManyDetail")
            this.createRoute("store", "post", storeDestroyRoutePath, detail.id, "BelonsToManyDetail")
            this.createRoute("destroy", "delete", storeDestroyRoutePath, detail.id, "BelonsToManyDetail")
        })
    }

    createRoute(name: string, method: string, path: string, routableId: string, routableType: String) {
        Route.create({
            name,
            tag: name,
            method,
            path,
            type: RouteType.API_ROUTE,
            routableId,
            routableType,
            projectId: this.crud.projectId,
        })
    }
}