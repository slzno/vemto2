import {
    RenderableFileFormatter,
    RenderableFileType,
} from "@Common/models/RenderableFile"
import Crud from "@Common/models/crud/Crud"
import Renderable from "@Renderer/codegen/sequential/services/foundation/Renderable"

export default class RenderableApiController extends Renderable {
    crud: Crud
    
    constructor(crud: Crud) {
        super()

        this.crud = crud
    }

    canRender(): boolean {
        return true
    }

    getType(): RenderableFileType {
        return RenderableFileType.PHP
    }

    getTemplateFile(): string {
        return "crud/views/api/ApiController.vemtl"
    }

    getPath(): string {
        return `app/Http/Controllers/Api`
    }

    getFilename(): string {
        return `${this.crud.model.getControllerName()}.php`
    }

    getFormatter(): RenderableFileFormatter {
        return RenderableFileFormatter.PHP
    }

    getData() {
        return {
            crud: this.crud,
            project: this.project,
        }
    }
}
