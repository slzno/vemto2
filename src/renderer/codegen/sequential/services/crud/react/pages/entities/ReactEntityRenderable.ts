import * as changeCase from "change-case"
import Crud from "@Common/models/crud/Crud"
import Renderable from "@Renderer/codegen/sequential/services/foundation/Renderable"
import {
    RenderableFileFormatter,
    RenderableFileType,
} from "@Common/models/RenderableFile"

export default class ReactEntityRenderable extends Renderable {
    crud: Crud

    constructor(crud: Crud) {
        super()

        this.crud = crud
    }

    canRender(): boolean {
        return true
    }

    getType(): RenderableFileType {
        return RenderableFileType.TS
    }

    getTemplateFile(): string {
        return "crud/react/pages/entities/Entity.vemtl"
    }

    getPath(): string {
        const viewsFolder = this.crud.section.getFolderName()
        const folder = changeCase.paramCase(this.crud.plural)
        return `resources/js/pages/${viewsFolder}/${folder}/entities`
    }

    getFilename(): string {
        return `${this.crud.name}Entity.ts`
    }

    getFormatter(): RenderableFileFormatter {
        return RenderableFileFormatter.TS
    }

    getData() {
        return {
            crud: this.crud,
        }
    }

    addDependencies() {}
}
