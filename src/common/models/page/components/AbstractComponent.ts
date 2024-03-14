import Component from "./interfaces/Component"
import Alert from "@Renderer/components/utils/Alert"
import ComponentHelper from "./services/ComponentHelper"
import TemplateEngine from "@tiago_silva_pereira/vemto-template-engine"
import BladeFormatter from "@Renderer/codegen/formatters/BladeFormatter"

export default abstract class AbstractComponent implements Component {
    id: string
    type: string
    subType: string
    settings: any
    category: string
    location: string

    constructor(componentData: any) {
        this.id = componentData.id
        this.type = componentData.type
        this.settings = componentData.settings
        this.category = componentData.category
        this.subType = componentData.subType || 'default'
        this.location = componentData.location || 'components'

        this.getNestedComponentsKeys().forEach((key: string) => {
            this[key] = componentData[key] || []
        })
    }

    getSettingsAsKeyValue(): any {
        const settings = this.getSettings()

        const settingsAsKeyValue: any = {}

        Object.keys(settings).forEach((key: string) => {
            settingsAsKeyValue[key] = settings[key].default || ''
        })

        return settingsAsKeyValue
    }

    abstract getName(): string
    abstract getLabel(): string
    abstract getSettings(): any

    hasNestedComponents(): boolean {
        return false
    }

    getNestedComponentsKeys(): string[] {
        return []
    }

    getNestedComponents(key: string): any[] {
        if(!this.hasNestedComponents()) {
            return []
        }

        if(!this[key]) {
            return []
        }

        return this[key].map((component: any) => ComponentHelper.getComponentHandler(component))
    }
}