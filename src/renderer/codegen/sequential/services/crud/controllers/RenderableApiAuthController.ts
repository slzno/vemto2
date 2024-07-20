import {
    RenderableFileFormatter,
    RenderableFileType,
} from "@Common/models/RenderableFile"
import Model from "@Common/models/Model"
import Renderable from "@Renderer/codegen/sequential/services/foundation/Renderable"

export default class RenderableApiAuthController extends Renderable {
    model: Model
    
    constructor(model: Model) {
        super()

        this.model = model
    }

    canRender(): boolean {
        return true
    }

    getType(): RenderableFileType {
        return RenderableFileType.PHP
    }

    getTemplateFile(): string {
        return "api/ApiAuthController.vemtl"
    }

    getPath(): string {
        return `app/Http/Controllers/Api`
    }

    getFilename(): string {
        return `AuthController.php`
    }

    getFormatter(): RenderableFileFormatter {
        return RenderableFileFormatter.PHP
    }

    getData() {
        return {
            model: this.model,
            project: this.project,
        }
    }
}
