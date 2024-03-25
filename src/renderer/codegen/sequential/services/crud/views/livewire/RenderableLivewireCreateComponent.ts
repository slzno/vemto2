import * as changeCase from "change-case"
import Crud from "@Common/models/crud/Crud"
import Renderable from "@Renderer/codegen/sequential/services/foundation/Renderable"
import {
    RenderableFileFormatter,
    RenderableFileType,
} from "@Common/models/RenderableFile"
import Namespace from "@Renderer/codegen/util/Namespace"

export default class RenderableLivewireCreateComponent extends Renderable {
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
        return "crud/views/livewire/CreateComponent.vemtl"
    }

    getPath(): string {
        return Namespace.from(this.crud.livewireNamespace).toPath()
    }

    getFilename(): string {
        return `${this.crud.livewireCreateComponentName}.php`
    }

    getFormatter(): RenderableFileFormatter {
        return RenderableFileFormatter.PHP
    }

    hooks() {
        return this.crud.getHooks('filamentCreateComponent')
    }
    
    getData() {
        return {
            crud: this.crud,
        }
    }

    addDependencies() {
        Renderable.addComposerDependency("livewire/livewire", this.getTemplateFile())
    }
}
