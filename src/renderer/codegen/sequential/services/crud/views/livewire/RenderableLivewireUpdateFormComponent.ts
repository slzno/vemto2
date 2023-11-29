import * as changeCase from "change-case"
import Crud from "@Common/models/crud/Crud"
import Renderable from "@Renderer/codegen/sequential/services/foundation/Renderable"
import {
    RenderableFileFormatter,
    RenderableFileType,
} from "@Common/models/RenderableFile"
import Namespace from "@Renderer/codegen/util/Namespace"

export default class RenderableLivewireUpdateFormComponent extends Renderable {
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
        return "crud/views/livewire/UpdateFormComponent.vemtl"
    }

    getPath(): string {
        return Namespace.from(this.crud.livewireFormsNamespace).toPath()
    }

    getFilename(): string {
        let filename = 'UpdateForm.php'

        if(this.crud.isHasManyDetail) {
            filename = `UpdateDetailForm.php`
        }

        return filename
    }

    getFormatter(): RenderableFileFormatter {
        return RenderableFileFormatter.PHP
    }

    hooks() {
        let hookName = 'updateFormComponent'

        if(this.crud.isHasManyDetail) {
            hookName = 'updateDetailFormComponent'
        }

        return this.crud.getHooks(hookName)
    }

    getData() {
        return {
            crud: this.crud,
        }
    }
}
