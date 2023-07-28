import Component from "./interfaces/Component"

import AbstractComponent from "./AbstractComponent"

export default class ForelseComponent extends AbstractComponent implements Component {
    foreachComponents: any[]
    emptyComponents: any[]

    getLabel(): string {
        return 'Forelse'
    }

    getName(): string {
        return 'ForelseComponent'
    }

    getRenderCode(): string {
        return `
            @forelse(<$ this.settings.content $>)
            // nested
            @empty
            // nested
            @endforelse
        `
    }

    hasNestedComponents(): boolean {
        return true
    }

    getNestedComponentsKeys(): string[] {
        return ['foreachComponents', 'emptyComponents']
    }

    getSettings(): any {
        return {
            content: {
                type: 'text',
                default: '$items as $item',
            }
        }
    }
}