import Component from "./interfaces/Component"
import AbstractComponent from "./AbstractComponent"

export default class HeaderOneComponent extends AbstractComponent implements Component {

    getLabel(): string {
        return 'H1'
    }

    getPreviewCode(): string {
        return `<input 
            spellcheck="false"
            autocomplete="off"
            v-model="component.settings.content"
            class="outline-none text-5xl font-bold bg-transparent w-full"
        />`
    }

    getRenderCode(): string {
        return `<h1><$ this.settings.content $></h1>`
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