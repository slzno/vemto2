import Route, { RouteType } from "@Common/models/Route";
import Crud from "../Crud";
import { camelCase, paramCase } from "change-case";
import HasManyDetail from "../HasManyDetail";
import BelongsToManyDetail from "../BelongsToManyDetail";

export default class GenerateCrudApiRoutes {
    crud: Crud

    constructor(crud: Crud) {
        this.crud = crud
    }

    generate() {
        this.generateCrudRoutes()
    }

    getRoutePath(...paths: string[]) {
        return `${this.crud.getBaseRoutePath()}/${paths.join("/")}`
    }

    generateCrudRoutes() {
        const crudModelName = camelCase(this.crud.model.name),
            crudModelPlural = paramCase(this.crud.model.plural),
            completeRouteAction = (methodName: string) => `[${this.crud.model.getControllerName()}::class, '${methodName}']`

        this.createRoute(`${crudModelPlural}.index`, "get", this.getRoutePath(), this.crud.id, "Crud", completeRouteAction('index'))
        this.createRoute(`${crudModelPlural}.store`, "post", this.getRoutePath(), this.crud.id, "Crud", completeRouteAction('store'))
        this.createRoute(`${crudModelPlural}.show`, "get", this.getRoutePath(`{${crudModelName}}`), this.crud.id, "Crud", completeRouteAction('show'))
        this.createRoute(`${crudModelPlural}.update`, "put", this.getRoutePath(`{${crudModelName}}`), this.crud.id, "Crud", completeRouteAction('update'))
        this.createRoute(`${crudModelPlural}.destroy`, "delete", this.getRoutePath(`{${crudModelName}}`), this.crud.id, "Crud", completeRouteAction('destroy'))
    }

    generateHasManyRelationshipRoutes(detail: HasManyDetail) {
        const detailCrudModelPlural = paramCase(detail.detailCrud.model.plural),
            detailCrudModelName = camelCase(detail.detailCrud.model.name),
            crudModelPlural = paramCase(this.crud.model.plural),
            completeRouteAction = (methodName: string) => `[${detail.getApiControllerName()}::class, '${methodName}']`

        const indexStoreRoutePath = this.getRoutePath(detailCrudModelPlural, `{${detailCrudModelName}}`)

        this.createRoute(`${crudModelPlural}.${detailCrudModelPlural}.index`, "get", indexStoreRoutePath, detail.id, "HasManyDetail", completeRouteAction('index'))
        this.createRoute(`${crudModelPlural}.${detailCrudModelPlural}.store`, "post", indexStoreRoutePath, detail.id, "HasManyDetail", completeRouteAction('store'))
    }

    generateBelongsToManyRelationshipRoutes(detail: BelongsToManyDetail) {
        const detailCrudModelName = camelCase(detail.crud.model.name),
            detailRelatedCrudModelPlural = paramCase(detail.detailCrud.model.plural),
            detailRelatedCrudModelName = camelCase(detail.detailCrud.model.name),
            crudModelPlural = paramCase(this.crud.model.plural),
            completeRouteAction = (methodName: string) => `[${detail.getApiControllerName()}::class, '${methodName}']`

        const indexRoutePath = this.getRoutePath(`{${detailCrudModelName}}`, detailRelatedCrudModelPlural),
            storeDestroyRoutePath = this.getRoutePath(`{${detailCrudModelName}}`, detailRelatedCrudModelPlural, `{${detailRelatedCrudModelName}}`)

        this.createRoute(`${crudModelPlural}.${detailRelatedCrudModelPlural}.index`, "get", indexRoutePath, detail.id, "BelonsToManyDetail", completeRouteAction('index'))
        this.createRoute(`${crudModelPlural}.${detailRelatedCrudModelPlural}.store`, "post", storeDestroyRoutePath, detail.id, "BelonsToManyDetail", completeRouteAction('store'))
        this.createRoute(`${crudModelPlural}.${detailRelatedCrudModelPlural}.destroy`, "delete", storeDestroyRoutePath, detail.id, "BelonsToManyDetail", completeRouteAction('destroy'))
    }

    createRoute(name: string, method: string, path: string, routableId: string, routableType: String, customContent: string = "") {
        Route.create({
            name,
            method,
            path,
            tag: name,
            type: RouteType.API_ROUTE,
            routableId,
            routableType,
            projectId: this.crud.projectId,
            hasCustomContent: true,
            customContent
        })
    }
}