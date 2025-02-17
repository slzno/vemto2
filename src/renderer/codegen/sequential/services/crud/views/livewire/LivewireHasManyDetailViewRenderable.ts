import HasManyDetail from "@Common/models/crud/HasManyDetail"
import Renderable from "@Renderer/codegen/sequential/services/foundation/Renderable"
import {
    RenderableFileFormatter,
    RenderableFileType,
} from "@Common/models/RenderableFile"
import { pascalCase, paramCase } from "change-case"

export default class LivewireHasManyDetailViewRenderable extends Renderable {
    hasManyDetail: HasManyDetail

    constructor(hasManyDetail: HasManyDetail) {
        super()

        this.hasManyDetail = hasManyDetail
    }

    canRender(): boolean {
        return true
    }

    getType(): RenderableFileType {
        return RenderableFileType.BLADE
    }

    getTemplateFile(): string {
        return "crud/views/livewire/HasManyDetailView.vemtl"
    }

    getPath(): string {
        // It is generated on the parent crud's livewire namespace
        const viewsFolder = this.hasManyDetail.crud.section.getFolderName(), 
            folder = paramCase(this.hasManyDetail.crud.plural)

        return `resources/views/livewire/${viewsFolder}/${folder}`
    }

    getFilename(): string {
        return `${paramCase(this.hasManyDetail.detailCrud.plural)}-detail.blade.php`
    }

    getFormatter(): RenderableFileFormatter {
        return RenderableFileFormatter.BLADE
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
