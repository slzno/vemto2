import Component from "./interfaces/Component"
import AbstractComponent from "./AbstractComponent"

export default class CustomComponent extends AbstractComponent implements Component {

    getLabel(): string {
        return 'Custom'
    }

    getPreviewCode(): string {
        return `<input 
            spellcheck="false"
            autocomplete="off"
            v-model="component.settings.content"
            class="outline-none bg-transparent w-full"
        />`
    }

    getRenderCode(): string {
        return `<$ this.settings.content $>`
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