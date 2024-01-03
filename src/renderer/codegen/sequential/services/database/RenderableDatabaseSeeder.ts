import Model from "@Common/models/Model"
import Renderable from "@Renderer/codegen/sequential/services/foundation/Renderable"
import { RenderableFileFormatter, RenderableFileType } from "@Common/models/RenderableFile"

export default class RenderableDatabaseSeeder extends Renderable {

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
        return "database/DatabaseSeeder.vemtl"
    }

    getPath(): string {
        return "database/seeders"
    }

    getFilename(): string {
        return `DatabaseSeeder.php`
    }

    getFormatter(): RenderableFileFormatter {
        return RenderableFileFormatter.PHP
    }

    getData() {
        return {}
    }
}