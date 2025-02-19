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
        templateContent = `
            <% const snakeCase = this.require('snakeCase') %>
            <% const camelCase = this.require('camelCase') %>
            <% const paramCase = this.require('paramCase') %>
            <% const pascalCase = this.require('pascalCase') %>
            
        ` + templateContent

        console.log("Before compile", templateContent)

        return templateContent
    }

    protected afterCompile(compiledTemplate: string): string {
        return compiledTemplate.trim()
    }

    getData() {
        return {}
    }
}