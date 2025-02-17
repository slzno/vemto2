import Crud from "@Common/models/crud/Crud"
import Renderable from "@Renderer/codegen/sequential/services/foundation/Renderable"
import {
    RenderableFileFormatter,
    RenderableFileType,
} from "@Common/models/RenderableFile"
import Namespace from "@Renderer/codegen/util/Namespace"
import { pascalCase } from "pascal-case"

export default class NovaResourceRenderable extends Renderable {
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
        return "crud/views/nova/ResourceComponent.vemtl"
    }

    getPath(): string {
        return Namespace.from(`App\\Nova`).toPath()
    }

    getFilename(): string {
        return `${pascalCase(this.crud.settings.itemName)}.php`
    }

    getFormatter(): RenderableFileFormatter {
        return RenderableFileFormatter.PHP
    }

    hooks() {
        return this.crud.getHooks('novaResource')
    }
    
    getData() {
        return {
            crud: this.crud,
            model: this.crud.model,
        }
    }
}
