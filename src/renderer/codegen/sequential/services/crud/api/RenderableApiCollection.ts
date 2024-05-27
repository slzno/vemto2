import Model from "@Common/models/Model"
import {
    RenderableFileFormatter,
    RenderableFileType,
} from "@Common/models/RenderableFile"
import Renderable from "@Renderer/codegen/sequential/services/foundation/Renderable"
import { pascalCase } from "change-case"

export default class RenderableApiCollection extends Renderable {
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
        return "crud/views/api/ApiCollection.vemtl"
    }

    getPath(): string {
        return `app/Http/Resources`
    }

    getFilename(): string {
        return `${pascalCase(this.model.name)}Collection.php`
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
