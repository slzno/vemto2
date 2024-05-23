import Route from "@Common/models/Route"
import Renderable from "@Renderer/codegen/sequential/services/foundation/Renderable"
import {
    RenderableFileFormatter,
    RenderableFileType,
} from "@Common/models/RenderableFile"

export default class ApiRoutes extends Renderable {
    routes: Route[]

    constructor(routes: Route[]) {
        super()

        this.routes = routes
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
        }
    }
}
