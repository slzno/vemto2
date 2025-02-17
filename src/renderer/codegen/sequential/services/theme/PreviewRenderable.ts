import Renderable from "@Renderer/codegen/sequential/services/foundation/Renderable"
import {
    RenderableFileFormatter,
    RenderableFileType,
} from "@Common/models/RenderableFile"

export default class PreviewRenderable extends Renderable {
    canRender(): boolean {
        return true
    }

    getType(): RenderableFileType {
        return RenderableFileType.HTML
    }

    getTemplateFile(): string {
        return "theme/Preview.vemtl"
    }

    getPath(): string {
        return ``
    }

    getFilename(): string {
        return ``
    }

    getFormatter(): RenderableFileFormatter {
        return RenderableFileFormatter.HTML
    }

    getData() {
        return {}
    }
}
