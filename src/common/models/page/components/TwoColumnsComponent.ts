import Component from "./interfaces/Component"
import AbstractComponent from "./AbstractComponent"

export default class TwoColumnsComponent extends AbstractComponent implements Component {

    getLabel(): string {
        return 'Two Columns'
    }

    getPreviewCode(): string {
        return `
            <div class="columns-1 lg:columns-2">
                <div id="firstColumnComponents" class="border border-slate-600 bg-slate-800 border-dotted p-2" style="min-height: 10rem;">
                </div>
                <div id="secondColumnComponents" class="border border-slate-600 bg-slate-800 border-dotted p-2" style="min-height: 10rem;">
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