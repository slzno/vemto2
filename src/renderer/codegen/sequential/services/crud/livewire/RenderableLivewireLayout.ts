import * as changeCase from "change-case"
import Crud from "@Common/models/crud/Crud"
import Renderable from "@Renderer/codegen/sequential/services/foundation/Renderable"
import {
    RenderableFileFormatter,
    RenderableFileType,
} from "@Common/models/RenderableFile"

export default class RenderableLivewireLayout extends Renderable {

    constructor() {
        super()
    }

    canRender(): boolean {
        return this.project.settings.usesLivewire
    }

    getType(): RenderableFileType {
        return RenderableFileType.HTML
    }

    getTemplateFile(): string {
        if(this.project.isBreeze()) {
            return "crud/views/livewire/BreezeLayoutComponent.vemtl"
        }

        return "crud/views/livewire/JetstreamLayoutComponent.vemtl"
    }

    getPath(): string {
        return `resources/views/components/layouts`
    }

    getFilename(): string {
        return "app.blade.php"
    }

    getFormatter(): RenderableFileFormatter {
        return RenderableFileFormatter.HTML
    }

    getData() {
        return {}
    }
}
