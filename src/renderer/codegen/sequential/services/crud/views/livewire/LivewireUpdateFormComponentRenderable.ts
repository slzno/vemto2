import * as changeCase from "change-case"
import Crud from "@Common/models/crud/Crud"
import Renderable from "@Renderer/codegen/sequential/services/foundation/Renderable"
import {
    RenderableFileFormatter,
    RenderableFileType,
} from "@Common/models/RenderableFile"
import Namespace from "@Renderer/codegen/util/Namespace"

export default class LivewireUpdateFormComponentRenderable extends Renderable {
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
        return "crud/views/livewire/UpdateFormComponent.vemtl"
    }

    getPath(): string {
        return Namespace.from(this.crud.livewireFormsNamespace).toPath()
    }

    getFilename(): string {
        return 'UpdateForm.php'
    }

    getFormatter(): RenderableFileFormatter {
        return RenderableFileFormatter.PHP
    }

    hooks() {
        return this.crud.getHooks('updateFormComponent')
    }

    getData() {
        return {
            crud: this.crud,
        }
    }

    addDependencies() {
        this.addComposerDependency("livewire/livewire")
    }
}
