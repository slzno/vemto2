import Renderable from "@Renderer/codegen/sequential/services/foundation/Renderable"
import { RenderableFileFormatter, RenderableFileType } from "@Common/models/RenderableFile"

export default class BreezeNavigationRenderable extends Renderable {
    canRender(): boolean {
        return true
    }

    getType(): RenderableFileType {
        return RenderableFileType.PHP
    }

    getTemplateFile(): string {
        return "menu/breeze/Navigation.vemtl"
    }

    getPath(): string {
        return "resources/views/livewire/layout"
    }

    getFilename(): string {
        return `navigation.blade.php`
    }

    getFormatter(): RenderableFileFormatter {
        return RenderableFileFormatter.BLADE
    }

    getData() {
        return {}
    }
}