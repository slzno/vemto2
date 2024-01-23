import Crud from "@Common/models/crud/Crud"
import Renderable from "@Renderer/codegen/sequential/services/foundation/Renderable"
import {
    RenderableFileFormatter,
    RenderableFileType,
} from "@Common/models/RenderableFile"
import Namespace from "@Renderer/codegen/util/Namespace"
import HasManyDetail from "@Common/models/crud/HasManyDetail"
import MorphManyDetail from "@Common/models/crud/MorphManyDetail"

export default class RenderableFilamentCommonRelationManager extends Renderable {
    detail: HasManyDetail | MorphManyDetail

    constructor(detail: HasManyDetail | MorphManyDetail) {
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
        return "crud/views/filament/RelationManager.vemtl"
    }

    getPath(): string {
        const crud = this.detail.crud

        return Namespace.from(`App\\Filament\\Resources\\${crud.section.name}\\${crud.name}Resource\\RelationManagers`).toPath()
    }

    getFilename(): string {
        return `${this.detail.relationship.relatedModel.plural}RelationManager.php`
    }

    getFormatter(): RenderableFileFormatter {
        return RenderableFileFormatter.PHP
    }

    hooks() {
        return this.detail.crud.getHooks('filamentRelationManager')
    }
    
    getData() {
        return {
            detail: this.detail
        }
    }
}
