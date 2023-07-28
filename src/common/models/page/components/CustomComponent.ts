import Component from "./interfaces/Component"
import AbstractComponent from "./AbstractComponent"

export default class CustomComponent extends AbstractComponent implements Component {

    getLabel(): string {
        return 'Custom'
    }

    getName(): string {
        return 'CustomComponent'
    }

    getRenderCode(): string {
        return `<$ this.settings.content $>`
    }

    getSettings(): any {
        return {
            content: {
                type: 'text',
                default: 'Your custom HTML or Text goes here',
            }
        }
    }

}