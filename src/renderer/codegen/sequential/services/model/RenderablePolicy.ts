import Model from "@Common/models/Model"
import Renderable from "@Renderer/codegen/sequential/services/foundation/Renderable"
import { RenderableFileFormatter, RenderableFileType } from "@Common/models/RenderableFile"

export default class RenderablePolicy extends Renderable {
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
        return "models/Policy.vemtl"
    }

    getPath(): string {
        return "app/Policies"
    }

    getFilename(): string {
        return `${this.model.name}Policy.php`
    }

    getFormatter(): RenderableFileFormatter {
        return RenderableFileFormatter.PHP
    }

    hooks() {
        return this.model.getHooks('policy')
    }

    getData() {
        return {
            model: this.model,
        }
    }
}