import Route from "@Common/models/Route"
import Renderable from "@Renderer/codegen/sequential/services/foundation/Renderable"
import {
    RenderableFileFormatter,
    RenderableFileType,
} from "@Common/models/RenderableFile"

export default class RoutesRenderable extends Renderable {
    routes: Route[]

    constructor() {
        super()

        this.routes = Route.getWebRoutes()
    }

    canRender(): boolean {
        return true
    }

    getType(): RenderableFileType {
        return RenderableFileType.PHP
    }

    getTemplateFile(): string {
        return "routes/Routes.vemtl"
    }

    getPath(): string {
        return `routes`
    }

    getFilename(): string {
        return "app.php"
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
