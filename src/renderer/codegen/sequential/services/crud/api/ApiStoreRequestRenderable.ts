import Model from "@Common/models/Model"
import {
    RenderableFileFormatter,
    RenderableFileType,
} from "@Common/models/RenderableFile"
import Crud from "@Common/models/crud/Crud"
import Renderable from "@Renderer/codegen/sequential/services/foundation/Renderable"
import { pascalCase } from "change-case"

export default class ApiStoreRequestRenderable extends Renderable {
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
        return "api/ApiStoreRequest.vemtl"
    }

    getPath(): string {
        return `app/Http/Requests`
    }

    getFilename(): string {
        return `${pascalCase(this.crud.model.name)}StoreRequest.php`
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
