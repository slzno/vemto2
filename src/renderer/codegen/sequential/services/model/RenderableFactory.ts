import Model from "@Common/models/Model"
import Renderable from "@Renderer/codegen/sequential/services/foundation/Renderable"
import { RenderableFileFormatter, RenderableFileType } from "@Common/models/RenderableFile"

export default class RenderableFactory extends Renderable {
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
        return "database/Factory.vemtl"
    }

    getPath(): string {
        return "database/factories"
    }

    getFilename(): string {
        return `${this.model.name}Factory.php`
    }

    getFormatter(): RenderableFileFormatter {
        return RenderableFileFormatter.PHP
    }

    getData() {
        return {
            model: this.model,
        }
    }
}