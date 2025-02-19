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

    protected beforeCompile(templateContent: string): string {
        let templateInports = ``

        if(!templateContent.includes("const snakeCase =")) {
            templateInports += `const snakeCase = this.require('snakeCase')\n`
        }

        if(!templateContent.includes("const camelCase =")) {
            templateInports += `const camelCase = this.require('camelCase')\n`
        }

        if(!templateContent.includes("const paramCase =")) {
            templateInports += `const paramCase = this.require('paramCase')\n`
        }

        if(!templateContent.includes("const pascalCase =")) {
            templateInports += `const pascalCase = this.require('pascalCase')\n`
        }

        if(!templateContent.includes("const ComponentRenderer =")) {
            templateInports += `const ComponentRenderer = this.require('ComponentRenderer')\n`
        }

        if(!templateContent.includes("const InputRenderer =")) {
            templateInports += `const InputRenderer = this.require('InputRenderer')\n`
        }

        return `${templateInports}\n${templateContent}`
    }

    protected afterCompile(compiledTemplate: string): string {
        return compiledTemplate.trim()
    }

    getData() {
        return {}
    }
}