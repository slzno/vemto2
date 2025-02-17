import Model from "@Common/models/Model"
import Renderable from "@Renderer/codegen/sequential/services/foundation/Renderable"
import { RenderableFileFormatter, RenderableFileType } from "@Common/models/RenderableFile"

export default class ModelRenderable extends Renderable {
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
        return "models/Model.vemtl"
    }

    getPath(): string {
        return "app/Models"
    }

    getFilename(): string {
        return `${this.model.name}.php`
    }

    getFormatter(): RenderableFileFormatter {
        return RenderableFileFormatter.PHP
    }

    hooks() {
        return this.model.getHooks('model')
    }

    getData() {
        return {
            model: this.model,
        }
    }
}