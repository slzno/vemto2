import Route from "@Common/models/Route"
import Renderable from "@Renderer/codegen/sequential/services/foundation/Renderable"
import {
    RenderableFileFormatter,
    RenderableFileType,
} from "@Common/models/RenderableFile"
import Crud from "@Common/models/crud/Crud"

export default class ApiRoutes extends Renderable {
    routes: Route[]
    cruds: Crud[]

    constructor(routes: Route[], cruds: Crud[]) {
        super()

        this.routes = routes
        this.cruds = cruds
    }

    canRender(): boolean {
        return true
    }

    getType(): RenderableFileType {
        return RenderableFileType.PHP
    }

    getTemplateFile(): string {
        return "routes/ApiRoutes.vemtl"
    }

    getPath(): string {
        return `routes`
    }

    getFilename(): string {
        return "app-api.php"
    }

    getFormatter(): RenderableFileFormatter {
        return RenderableFileFormatter.PHP
    }

    getData() {
        return {
            routes: this.routes,
            cruds: this.cruds,
        }
    }
}
