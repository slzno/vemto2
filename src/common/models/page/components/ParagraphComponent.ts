import Component from "./interfaces/Component"

import AbstractComponent from "./AbstractComponent"

export default class ParagraphComponent extends AbstractComponent implements Component {
    getLabel(): string {
        return 'Paragraph'
    }

    getName(): string {
        return 'ParagraphComponent'
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