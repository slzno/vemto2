import Renderable from "@Renderer/codegen/sequential/services/foundation/Renderable"
import { RenderableFileFormatter, RenderableFileType } from "@Common/models/RenderableFile"

export default class CustomRenderable extends Renderable {

    constructor() {
        super()
    }

    canRender(): boolean {
        return true
    }

    getType(): RenderableFileType {
        return RenderableFileType.TXT
    }

    getTemplateFile(): string {
        return "CustomTemplate"
    }

    getPath(): string {
        return ""
    }

    getFilename(): string {
        return "CustomFile"
    }

    getFormatter(): RenderableFileFormatter {
        return RenderableFileFormatter.NONE
    }

    

    getData() {
        return {}
    }
}