import * as changeCase from "change-case"
import Page from "@Common/models/page/Page"
import Renderable from "@Renderer/codegen/sequential/services/foundation/Renderable"
import {
    RenderableFileFormatter,
    RenderableFileType,
} from "@Common/models/RenderableFile"
import Namespace from "@Renderer/codegen/util/Namespace"

export default class RenderablePageComponent extends Renderable {
    page: Page

    constructor(page: Page) {
        super()

        this.page = page
    }

    canRender(): boolean {
        return true
    }

    getType(): RenderableFileType {
        return RenderableFileType.PHP
    }

    getTemplateFile(): string {
        return "page/PageComponent.vemtl"
    }

    getPath(): string {
        return Namespace.from(this.page.namespace).toPath()
    }

    getFilename(): string {
        const componentName = this.page.livewireComponentName || changeCase.pascalCase(this.page.name)

        return `${componentName}Page.php`
    }

    getFormatter(): RenderableFileFormatter {
        return RenderableFileFormatter.PHP
    }

    getData() {
        return {
            page: this.page,
        }
    }
}
