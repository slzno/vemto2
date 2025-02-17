import Crud from "@Common/models/crud/Crud"
import Renderable from "@Renderer/codegen/sequential/services/foundation/Renderable"
import {
    RenderableFileFormatter,
    RenderableFileType,
} from "@Common/models/RenderableFile"
import Namespace from "@Renderer/codegen/util/Namespace"
import { pascalCase } from "pascal-case"

export default class FilamentCreateComponentRenderable extends Renderable {
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
        return "crud/views/filament/CreateComponent.vemtl"
    }

    getPath(): string {
        return Namespace.from(`App\\Filament\\Resources\\${this.crud.section.getFileBasePath()}\\${pascalCase(this.crud.name)}Resource\\Pages`).toPath()
    }

    getFilename(): string {
        return `Create${pascalCase(this.crud.name)}.php`
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
        this.addComposerDependency("filament/filament")
    }
}
