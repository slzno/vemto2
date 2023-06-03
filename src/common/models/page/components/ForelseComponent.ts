import Component from "./interfaces/Component"

import AbstractComponent from "./AbstractComponent"

export default class ForelseComponent extends AbstractComponent implements Component {
    getLabel(): string {
        return 'Forelse'
    }

    getPreviewCode(): string {
        return `
            <div v-if="component.subType === 'forelse'">
                <span>@forelse(</span>
                <input 
                    spellcheck="false"
                    autocomplete="off"
                    v-model="component.settings.content"
                    class="outline-none bg-transparent font-semibold text-center"
                />
                <span>)</span>
            </div>

            <div v-if="component.subType === 'empty'">
                @empty
            </div>

            <div v-if="component.subType === 'endforelse'">
                @endforelse
            </div>
        `
    }

    getRenderCode(): string {
        return `<p><$ this.content $></p>`
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