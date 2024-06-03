import Model from "@Common/models/Model"
import Renderable from "@Renderer/codegen/sequential/services/foundation/Renderable"
import { RenderableFileFormatter, RenderableFileType } from "@Common/models/RenderableFile"

export default class RenderableSearchable extends Renderable {
    constructor() {
        super()
    }

    canRender(): boolean {
        return true
    }

    getType(): RenderableFileType {
        return RenderableFileType.PHP
    }

    getTemplateFile(): string {
        return "models/Scopes/Searchable.vemtl"
    }

    getPath(): string {
        return "app/Models/Scopes"
    }

    getFilename(): string {
        return `Searchable.php`
    }

    getFormatter(): RenderableFileFormatter {
        return RenderableFileFormatter.PHP
    }

    getData() {
        return {}
    }
}