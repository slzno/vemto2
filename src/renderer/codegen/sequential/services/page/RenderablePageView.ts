import * as changeCase from "change-case"
import Page from "@Common/models/page/Page"
import Renderable from "@Renderer/codegen/sequential/services/foundation/Renderable"
import {
    RenderableFileFormatter,
    RenderableFileType,
} from "@Common/models/RenderableFile"

export default class RenderablePageView extends Renderable {
    page: Page

    constructor(page: Page) {
        super()

        this.page = page
    }

    canRender(): boolean {
        return true
    }

    getType(): RenderableFileType {
        return RenderableFileType.HTML
    }

    getTemplateFile(): string {
        return "page/PageView.vemtl"
    }

    getPath(): string {
        const viewsFolder = changeCase.paramCase(this.page.section)

        return `resources/views/pages/${viewsFolder}`
    }

    getFilename(): string {
        return `${changeCase.paramCase(this.page.name)}.blade.php`
    }

    getFormatter(): RenderableFileFormatter {
        return RenderableFileFormatter.HTML
    }

    getData() {
        return {
            page: this.page,
        }
    }
}
