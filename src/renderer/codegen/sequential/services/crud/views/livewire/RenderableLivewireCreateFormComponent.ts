import * as changeCase from "change-case"
import Crud from "@Common/models/crud/Crud"
import Renderable from "@Renderer/codegen/sequential/services/foundation/Renderable"
import {
    RenderableFileFormatter,
    RenderableFileType,
} from "@Common/models/RenderableFile"
import Namespace from "@Renderer/codegen/util/Namespace"

export default class RenderableLivewireCreateFormComponent extends Renderable {
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
        return "crud/views/livewire/CreateFormComponent.vemtl"
    }

    getPath(): string {
        return Namespace.from(this.crud.livewireFormsNamespace).toPath()
    }

    getFilename(): string {
        return 'CreateForm.php'
    }

    getFormatter(): RenderableFileFormatter {
        return RenderableFileFormatter.PHP
    }

    hooks() {
        return this.crud.getHooks('createFormComponent')
    }

    getData() {
        return {
            crud: this.crud,
        }
    }
}
