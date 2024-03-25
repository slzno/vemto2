import Crud from "@Common/models/crud/Crud"
import Renderable from "@Renderer/codegen/sequential/services/foundation/Renderable"
import {
    RenderableFileFormatter,
    RenderableFileType,
} from "@Common/models/RenderableFile"
import Namespace from "@Renderer/codegen/util/Namespace"

export default class RenderableFilamentEditComponent extends Renderable {
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
        return "crud/views/filament/EditComponent.vemtl"
    }

    getPath(): string {
        return Namespace.from(`App\\Filament\\Resources\\${this.crud.section.name}\\${this.crud.name}Resource\\Pages`).toPath()
    }

    getFilename(): string {
        return `Edit${this.crud.name}.php`
    }

    getFormatter(): RenderableFileFormatter {
        return RenderableFileFormatter.PHP
    }

    hooks() {
        return this.crud.getHooks('filamentEditComponent')
    }
    
    getData() {
        return {
            crud: this.crud,
        }
    }

    addDependencies() {
        Renderable.addComposerDependency("filament/filament", this.getTemplateFile())
    }
}
