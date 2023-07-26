import Component from "./interfaces/Component"
import AbstractComponent from "./AbstractComponent"

export default class TwoColumnsComponent extends AbstractComponent implements Component {

    firstColumnComponents: any[]
    secondColumnComponents: any[]

    getLabel(): string {
        return 'Two Columns'
    }

    getPreviewCode(): string {
        return `
            <div class="columns-1 lg:columns-2">
                <div 
                    :id="'firstColumnComponents' + component.id" 
                    :component-id="component.id"
                    components-container="firstColumnComponents"
                    class="border border-slate-600 bg-slate-800 border-dotted p-2 pb-32">
                </div>
                <div 
                    :id="'secondColumnComponents' + component.id" 
                    :component-id="component.id"
                    components-container="secondColumnComponents" class="border border-slate-600 bg-slate-800 border-dotted p-2 pb-32">
                </div>
            </div>
        `
    }

    getRenderCode(): string {
        return `
        <div class="columns-1 lg:columns-2">
            <div></div>
            <div></div>
        </div>
        `
    }

    hasNestedComponents(): boolean {
        return true
    }

    getNestedComponentsKeys(): string[] {
        return ['firstColumnComponents', 'secondColumnComponents']
    }

    getSettings(): any {
        return {
            firstColumnComponents: [],
            secondColumnComponents: [],
        }
    }

}