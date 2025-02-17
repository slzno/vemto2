import Model from "@Common/models/Model"
import Renderable from "@Renderer/codegen/sequential/services/foundation/Renderable"
import { RenderableFileFormatter, RenderableFileType } from "@Common/models/RenderableFile"

export default class SeederRenderable extends Renderable {
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
        return "database/Seeder.vemtl"
    }

    getPath(): string {
        return "database/seeders"
    }

    getFilename(): string {
        return `${this.model.name}Seeder.php`
    }

    getFormatter(): RenderableFileFormatter {
        return RenderableFileFormatter.PHP
    }

    hooks() {
        return this.model.getHooks('seeder')
    }

    getData() {
        return {
            model: this.model,
        }
    }
}