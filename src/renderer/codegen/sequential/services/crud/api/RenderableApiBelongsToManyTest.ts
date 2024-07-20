import Relationship from "@Common/models/Relationship"
import {
    RenderableFileFormatter,
    RenderableFileType,
} from "@Common/models/RenderableFile"
import Crud from "@Common/models/crud/Crud"
import Renderable from "@Renderer/codegen/sequential/services/foundation/Renderable"
import { pascalCase } from "change-case"

export default class RenderableApiBelongsToManyTest extends Renderable {
    crud: Crud
    relationship: Relationship
    
    constructor(crud: Crud, relationship: Relationship) {
        super()

        this.crud = crud
        this.relationship = relationship
    }

    canRender(): boolean {
        return true
    }

    getType(): RenderableFileType {
        return RenderableFileType.PHP
    }

    getTemplateFile(): string {
        return "api/ApiBelongsToManyTest.vemtl"
    }

    getPath(): string {
        return `tests/Feature/Api`
    }

    getFilename(): string {
        return `${pascalCase(this.crud.model.name)}${pascalCase(this.relationship.relatedModel.plural)}Test.php`
    }

    getFormatter(): RenderableFileFormatter {
        return RenderableFileFormatter.PHP
    }

    getData() {
        return {
            crud: this.crud,
            relationship: this.relationship,
            project: this.project,
        }
    }
}
