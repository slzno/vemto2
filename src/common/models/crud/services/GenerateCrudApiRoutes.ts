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
        if(paths.length <= 0) {
            return `${this.crud.getBaseRoutePath()}`
        }
        
        return `${this.crud.getBaseRoutePath()}/${paths.join("/")}`
    }

    getRouteName(routePath: string) {
        return `${this.crud.getBaseRouteName()}.${routePath}`
    }

    generateCrudRoutes() {
        const crudModelName = camelCase(this.crud.settings.itemName),
            crudModelPlural = paramCase(this.crud.settings.collectionName),
            completeRouteAction = (methodName: string) => `[${this.crud.model.getControllerName()}::class, '${methodName}']`

        this.createRoute(
            `${crudModelPlural}.index`,
            "get",
            this.getRoutePath(),
            "Crud",
            this.crud.id,
            completeRouteAction('index')
        )

        this.createRoute(
            `${crudModelPlural}.store`,
            "post",
            this.getRoutePath(),
            "Crud",
            this.crud.id,
            completeRouteAction('store')
        )

        this.createRoute(
            `${crudModelPlural}.show`,
            "get",
            this.getRoutePath(`{${crudModelName}}`),
            "Crud",
            this.crud.id,
            completeRouteAction('show')
        )

        this.createRoute(
            `${crudModelPlural}.update`,
            "put",
            this.getRoutePath(`{${crudModelName}}`),
            "Crud",
            this.crud.id,
            completeRouteAction('update')
        )

        this.createRoute(
            `${crudModelPlural}.destroy`,
            "delete",
            this.getRoutePath(`{${crudModelName}}`),
            "Crud",
            this.crud.id,
            completeRouteAction('destroy')
        )
    }

    generateHasManyRelationshipRoutes(detail: HasManyDetail) {
        const detailCrudModelPlural = paramCase(detail.detailCrud.settings.collectionName),
            crudModelName = paramCase(detail.crud.settings.itemName),
            crudModelPlural = paramCase(this.crud.settings.collectionName),
            completeRouteAction = (methodName: string) => `[${detail.getApiControllerName()}::class, '${methodName}']`

        const indexStoreRoutePath = this.getRoutePath(`{${crudModelName}}`, detailCrudModelPlural)

        this.createRoute(
            `${detail.detailCrud.section.routePrefix}.${crudModelPlural}.${detailCrudModelPlural}.index`,
            "get",
            indexStoreRoutePath,
            "HasManyDetail",
            detail.id,
            completeRouteAction('index')
        )

        this.createRoute(
            `${detail.detailCrud.section.routePrefix}.${crudModelPlural}.${detailCrudModelPlural}.store`,
            "post",
            indexStoreRoutePath,
            "HasManyDetail",
            detail.id,
            completeRouteAction('store')
        )
    }

    generateBelongsToManyRelationshipRoutes(detail: BelongsToManyDetail) {
        const detailCrudModelName = camelCase(detail.crud.settings.itemName),
            detailRelatedCrudModelPlural = paramCase(detail.relationship.name),
            detailRelatedCrudModelName = camelCase(detail.relationship.relatedModel.name),
            crudModelPlural = paramCase(this.crud.settings.collectionName),
            completeRouteAction = (methodName: string) => `[${detail.getApiControllerName()}::class, '${methodName}']`

        const indexRoutePath = this.getRoutePath(`{${detailCrudModelName}}`, detailRelatedCrudModelPlural),
            storeDestroyRoutePath = this.getRoutePath(`{${detailCrudModelName}}`, detailRelatedCrudModelPlural, `{${detailRelatedCrudModelName}}`)

        this.createRoute(
            `${detail.detailCrud.section.routePrefix}.${crudModelPlural}.${detailRelatedCrudModelPlural}.index`,
            "get",
            indexRoutePath,
            "BelongsToManyDetail",
            detail.id,
            completeRouteAction('index')
        )

        this.createRoute(
            `${detail.detailCrud.section.routePrefix}.${crudModelPlural}.${detailRelatedCrudModelPlural}.store`,
            "post",
            storeDestroyRoutePath,
            "BelongsToManyDetail",
            detail.id,
            completeRouteAction('store')
        )

        this.createRoute(
            `${detail.detailCrud.section.routePrefix}.${crudModelPlural}.${detailRelatedCrudModelPlural}.destroy`,
            "delete",
            storeDestroyRoutePath,
            "BelongsToManyDetail",
            detail.id,
            completeRouteAction('destroy')
        )
    }

    createRoute(name: string, method: string, path: string, routableType: String, routableId: string, customContent: string = "") {
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