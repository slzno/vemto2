import Relationship from "@Common/models/Relationship"
import {
    RenderableFileFormatter,
    RenderableFileType,
} from "@Common/models/RenderableFile"
import Crud from "@Common/models/crud/Crud"
import Renderable from "@Renderer/codegen/sequential/services/foundation/Renderable"
import { pascalCase, capitalCase } from "change-case"

export default class RenderableApiHasManyTest extends Renderable {
    crud: Crud
    relationship: Relationship
    relationshipCrud: Crud
    
    constructor(crud: Crud, relationship: Relationship) {
        super()

        this.crud = crud
        this.relationship = relationship

        this.resolveRelationshipCrud()
    }

    canRender(): boolean {
        return true
    }

    getType(): RenderableFileType {
        return RenderableFileType.PHP
    }

    getTemplateFile(): string {
        return "crud/views/api/ApiHasManyTest.vemtl"
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

    resolveRelationshipCrud() {
        const cruds = this.relationship.relatedModel.cruds,
            existentCrud = cruds.length ? cruds[0] : null

        this.relationshipCrud = existentCrud || Crud.createFakeFromModel(this.relationship.relatedModel, {
            name: capitalCase(this.relationship.name)
        })
    }

    getData() {
        return {
            crud: this.crud,
            relationship: this.relationship,
            relationshipCrud: this.relationshipCrud,
            project: this.project,
        }
    }
}
