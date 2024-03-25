import Renderable from "@Renderer/codegen/sequential/services/foundation/Renderable"
import {
    RenderableFileFormatter,
    RenderableFileType,
} from "@Common/models/RenderableFile"
import Namespace from "@Renderer/codegen/util/Namespace"
import MorphToManyDetail from "../../../../../../../common/models/crud/MorphToManyDetail"

export default class RenderableFilamentMorphToManyRelationManager extends Renderable {
    detail: MorphToManyDetail

    constructor(detail: MorphToManyDetail) {
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

    addDependencies() {
        Renderable.addComposerDependency("filament/filament", this.getTemplateFile())
    }
}
