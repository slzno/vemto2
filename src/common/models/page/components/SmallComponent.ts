import Component from "./interfaces/Component"

import AbstractComponent from "./AbstractComponent"

export default class SmallComponent extends AbstractComponent implements Component {
    getLabel(): string {
        return 'Small'
    }

    getPreviewCode(): string {
        return `<input 
            spellcheck="false"
            autocomplete="off"
            v-model="component.settings.content"
            class="text-xs outline-none bg-transparent w-full"
        />`
    }

    getRenderCode(): string {
        return `<small><$ this.content $></small>`
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