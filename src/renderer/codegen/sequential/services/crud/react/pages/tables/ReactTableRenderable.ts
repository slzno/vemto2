import * as changeCase from "change-case"
import Crud from "@Common/models/crud/Crud"
import Renderable from "@Renderer/codegen/sequential/services/foundation/Renderable"
import {
    RenderableFileFormatter,
    RenderableFileType,
} from "@Common/models/RenderableFile"

export default class ReactTableRenderable extends Renderable {
    crud: Crud

    constructor(crud: Crud) {
        super()

        this.crud = crud
    }

    canRender(): boolean {
        return true
    }

    getType(): RenderableFileType {
        return RenderableFileType.TSX
    }

    getTemplateFile(): string {
        return "crud/react/pages/tables/Table.vemtl"
    }

    getPath(): string {
        const viewsFolder = this.crud.section.getFolderName()
        const folder = changeCase.paramCase(this.crud.plural)
        return `resources/js/pages/${viewsFolder}/${folder}/tables`
    }

    getFilename(): string {
        return `${this.crud.name}Table.tsx`
    }

    getFormatter(): RenderableFileFormatter {
        return RenderableFileFormatter.TSX
    }

    getData() {
        return {
            crud: this.crud,
        }
    }

    addDependencies() {}
}
