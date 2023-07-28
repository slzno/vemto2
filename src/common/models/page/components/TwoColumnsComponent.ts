import Component from "./interfaces/Component"
import AbstractComponent from "./AbstractComponent"

export default class TwoColumnsComponent extends AbstractComponent implements Component {

    firstColumnComponents: any[]
    secondColumnComponents: any[]

    getName(): string {
        return 'TwoColumnsComponent'
    }

    getLabel(): string {
        return 'Two Columns'
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
        return {}
    }

}