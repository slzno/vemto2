import * as changeCase from "change-case"
import Crud from "@Common/models/crud/Crud"
import Renderable from "@Renderer/codegen/sequential/services/foundation/Renderable"
import {
    RenderableFileFormatter,
    RenderableFileType,
} from "@Common/models/RenderableFile"

export default class RenderableLivewireIndexView extends Renderable {
    crud: Crud

    constructor(crud: Crud) {
        super()

        this.crud = crud
    }

    canRender(): boolean {
        return true
    }

    getType(): RenderableFileType {
        return RenderableFileType.HTML
    }

    getTemplateFile(): string {
        return "crud/views/livewire/IndexView.vemtl"
    }

    getPath(): string {
        const folder = changeCase.paramCase(this.crud.plural)

        return `resources/views/livewire/${folder}`
    }

    getFilename(): string {
        return "index.blade.php"
    }

    getFormatter(): RenderableFileFormatter {
        return RenderableFileFormatter.HTML
    }

    getData() {
        return {
            crud: this.crud,
        }
    }
}
