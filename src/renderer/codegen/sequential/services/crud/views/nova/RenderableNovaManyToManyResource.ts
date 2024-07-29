import Crud from "@Common/models/crud/Crud"
import Renderable from "@Renderer/codegen/sequential/services/foundation/Renderable"
import {
    RenderableFileFormatter,
    RenderableFileType,
} from "@Common/models/RenderableFile"
import Namespace from "@Renderer/codegen/util/Namespace"
import { pascalCase } from "pascal-case"
import BelongsToManyDetail from "@Common/models/crud/BelongsToManyDetail"
import MorphToManyDetail from "@Common/models/crud/MorphToManyDetail"

export default class RenderableNovaManyToManyResource extends Renderable {
    detail: BelongsToManyDetail | MorphToManyDetail

    constructor(detail: BelongsToManyDetail | MorphToManyDetail) {
        super()

        this.detail = detail
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
        return `${pascalCase(this.detail.detailCrud.settings.itemName)}.php`
    }

    getFormatter(): RenderableFileFormatter {
        return RenderableFileFormatter.PHP
    }

    hooks() {
        return this.detail.detailCrud.getHooks('novaResource')
    }
    
    getData() {
        return {
            crud: this.detail.detailCrud,
            model: this.detail.relationship.relatedModel,
        }
    }
}
