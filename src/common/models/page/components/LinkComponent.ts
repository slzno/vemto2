import Component from "./interfaces/Component"

import AbstractComponent from "./AbstractComponent"

export default class LinkComponent extends AbstractComponent implements Component {
    nestedComponents: any[]

    getLabel(): string {
        return 'Link'
    }

    getName(): string {
        return 'LinkComponent'
    }

    hasNestedComponents(): boolean {
        return true
    }

    getNestedComponentsKeys(): string[] {
        return ['nestedComponents']
    }

    getSettings(): any {
        return {
            href: {
                type: 'text',
                default: 'https://laravel.com',
            },
            content: {
                type: 'text',
                default: 'Laravel is Awesome',
            },
            target: {
                type: 'select',
                default: '_self',
            },
            mode: {
                type: 'select',
                default: 'text',
            },
        }
    }
}