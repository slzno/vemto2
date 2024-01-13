import Renderable from "@Renderer/codegen/sequential/services/foundation/Renderable"
import { RenderableFileFormatter, RenderableFileType } from "@Common/models/RenderableFile"

export default class RenderableUiComponent extends Renderable {
    filePath: string
    templateFilePath: string

    constructor(filePath: string, templateFilePath: string) {
        super()

        this.filePath = filePath
        this.templateFilePath = templateFilePath
    }

    canRender(): boolean {
        return true
    }

    getType(): RenderableFileType {
        return RenderableFileType.PHP
    }

    getTemplateFile(): string {
        return this.templateFilePath
    }

    getPath(): string {
        return "resources/views/components/ui"
    }

    getFilename(): string {
        return this.filePath
    }

    getFormatter(): RenderableFileFormatter {
        return RenderableFileFormatter.NONE
    }

    getData() {
        return {}
    }
}