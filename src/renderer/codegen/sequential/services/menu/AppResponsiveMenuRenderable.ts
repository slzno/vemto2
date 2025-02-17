import Renderable from "@Renderer/codegen/sequential/services/foundation/Renderable"
import { RenderableFileFormatter, RenderableFileType } from "@Common/models/RenderableFile"

export default class AppResponsiveMenuRenderable extends Renderable {
    canRender(): boolean {
        return true
    }

    getType(): RenderableFileType {
        return RenderableFileType.PHP
    }

    getTemplateFile(): string {
        return "menu/AppResponsiveMenu.vemtl"
    }

    getPath(): string {
        return "resources/views/partials"
    }

    getFilename(): string {
        return `app-responsive-menu.blade.php`
    }

    getFormatter(): RenderableFileFormatter {
        return RenderableFileFormatter.BLADE
    }

    getData() {
        return {}
    }
}