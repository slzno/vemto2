import { RenderableFileFormatter, RenderableFileType } from "@Common/models/RenderableFile"
import Renderable from "../foundation/Renderable"

export default class BootstrapAppRenderable extends Renderable {
    canRender(): boolean {
        return true
    }

    getType(): RenderableFileType {
        return RenderableFileType.PHP
    }

    getTemplateFile(): string {
        return "laravel/BootstrapApp.vemtl"
    }

    getPath(): string {
        return "bootstrap"
    }

    getFilename(): string {
        return `app.php`
    }

    getFormatter(): RenderableFileFormatter {
        return RenderableFileFormatter.PHP
    }

    getData() {
        return {}
    }
}
