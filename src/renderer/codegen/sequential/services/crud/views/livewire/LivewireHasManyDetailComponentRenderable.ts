import HasManyDetail from "@Common/models/crud/HasManyDetail"
import Renderable from "@Renderer/codegen/sequential/services/foundation/Renderable"
import {
    RenderableFileFormatter,
    RenderableFileType,
} from "@Common/models/RenderableFile"
import Namespace from "@Renderer/codegen/util/Namespace"
import { pascalCase } from "change-case"

export default class LivewireHasManyDetailComponentRenderable extends Renderable {
    hasManyDetail: HasManyDetail

    constructor(hasManyDetail: HasManyDetail) {
        super()

        this.hasManyDetail = hasManyDetail
    }

    canRender(): boolean {
        return true
    }

    getType(): RenderableFileType {
        return RenderableFileType.PHP
    }

    getTemplateFile(): string {
        return "crud/views/livewire/HasManyDetailComponent.vemtl"
    }

    getPath(): string {
        // It is generated on the parent crud's livewire namespace
        return Namespace.from(this.hasManyDetail.crud.livewireNamespace).toPath()
    }

    getFilename(): string {
        const parentCrudName = pascalCase(this.hasManyDetail.crud.name),
            detailCrudName = pascalCase(this.hasManyDetail.detailCrud.plural)

        return `${parentCrudName}${detailCrudName}Detail.php`
    }

    getFormatter(): RenderableFileFormatter {
        return RenderableFileFormatter.PHP
    }

    hooks() {
        return this.hasManyDetail.detailCrud.getHooks('editComponent')
    }

    getData() {
        return {
            hasManyDetail: this.hasManyDetail,
        }
    }

    addDependencies() {
        this.addComposerDependency("livewire/livewire")
    }
}
