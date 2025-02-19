import Relationship from "@Common/models/Relationship"
import {
    RenderableFileFormatter,
    RenderableFileType,
} from "@Common/models/RenderableFile"
import Crud from "@Common/models/crud/Crud"
import Renderable from "@Renderer/codegen/sequential/services/foundation/Renderable"
import { capitalCase } from "change-case"

export default class ApiHasManyControllerRenderable extends Renderable {
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
        return "api/ApiHasManyController.vemtl"
    }

    getPath(): string {
        return `app/Http/Controllers/Api`
    }

    getFilename(): string {
        return `${this.relationship.model.plural}${this.relationship.relatedModel.name}Controller.php`
    }

    getFormatter(): RenderableFileFormatter {
        return RenderableFileFormatter.PHP
    }

    resolveRelationshipCrud() {
        const cruds = this.relationship.relatedModel.cruds,
            existingCrud = cruds.length ? cruds[0] : null

        this.relationshipCrud = existingCrud || Crud.createFakeFromModel(this.relationship.relatedModel, {
            name: capitalCase(this.relationship.name)
        })
    }

    getData() {
        return {
            crud: this.crud,
            project: this.project,
            relationship: this.relationship,
            relationshipCrud: this.relationshipCrud,
        }
    }
}
