import Component from "./interfaces/Component"
import AbstractComponent from "./AbstractComponent"

export default class HeaderOneComponent extends AbstractComponent implements Component {

    getLabel(): string {
        return 'H1'
    }

    getName(): string {
        return 'HeaderOneComponent'
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