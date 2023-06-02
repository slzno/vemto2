import Component from "./interfaces/Component"
import AbstractComponent from "./AbstractComponent"

export default class HeaderOneComponent extends AbstractComponent implements Component {

    getPreviewCode(): string {
        return `<h1 class="text-5xl font-bold">{{content}}</h1>`
    }

    getRenderCode(): string {
        return `<h1>{{content}}</h1>`
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