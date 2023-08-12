import Component from "./interfaces/Component"

import AbstractComponent from "./AbstractComponent"

export default class SmallComponent extends AbstractComponent implements Component {
    getLabel(): string {
        return 'Small'
    }

    getName(): string {
        return 'SmallComponent'
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