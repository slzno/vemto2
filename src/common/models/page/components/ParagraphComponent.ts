import Component from "./interfaces/Component"

import AbstractComponent from "./AbstractComponent"

export default class ParagraphComponent extends AbstractComponent implements Component {
    getPreviewCode(): string {
        return `<p>{{content}}</p>`
    }

    getRenderCode(): string {
        return `<p>{{content}}</p>`
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