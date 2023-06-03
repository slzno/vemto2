import Component from "./interfaces/Component"

import AbstractComponent from "./AbstractComponent"

export default class ParagraphComponent extends AbstractComponent implements Component {
    getLabel(): string {
        return 'Paragraph'
    }

    getPreviewCode(): string {
        return `<input 
            v-model="internalComponent.settings.content"
            class="outline-none bg-transparent w-full"/>`
    }

    getRenderCode(): string {
        return `<p><$ this.content $></p>`
    }

    getSettings(): any {
        return {
            content: {
                type: 'text',
                default: 'Lorem Ipsum',
            }
        }
    }
}