import * as changeCase from "change-case"
import Crud from "@Common/models/crud/Crud"
import Renderable from "@Renderer/codegen/sequential/services/foundation/Renderable"
import {
    RenderableFileFormatter,
    RenderableFileType,
} from "@Common/models/RenderableFile"
import Namespace from "@Renderer/codegen/util/Namespace"
import HasManyDetail from "@Common/models/crud/HasManyDetail"

export default class RenderableLivewireCreateDetailFormComponent extends Renderable {
    detail: HasManyDetail

    constructor(detail: HasManyDetail) {
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
        return "crud/views/livewire/CreateDetailFormComponent.vemtl"
    }

    getPath(): string {
        return Namespace.from(this.detail.detailCrud.livewireFormsNamespace).toPath()
    }

    getFilename(): string {
        return 'CreateDetailForm.php'
    }

    getFormatter(): RenderableFileFormatter {
        return RenderableFileFormatter.PHP
    }

    hooks() {
        return this.detail.detailCrud.getHooks('createDetailFormComponent')
    }

    getData() {
        return {
            detail: this.detail,
            crud: this.detail.detailCrud,
        }
    }

    addDependencies() {
        Renderable.addComposerDependency("livewire/livewire", this.getTemplateFile())
    }
}
