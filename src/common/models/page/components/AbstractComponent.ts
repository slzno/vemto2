import Component from "./interfaces/Component"

export default abstract class AbstractComponent implements Component {
    id: string
    type: string
    subType: string
    settings: any
    category: string

    constructor(componentData: any) {
        this.id = componentData.id
        this.type = componentData.type
        this.settings = componentData.settings
        this.category = componentData.category
        this.subType = componentData.subType || 'default'
    }

    getSettingsAsKeyValue(): any {
        const settings = this.getSettings()

        const settingsAsKeyValue: any = {}

        Object.keys(settings).forEach((key: string) => {
            settingsAsKeyValue[key] = settings[key].default || ''
        })

        return settingsAsKeyValue
    }

    abstract getLabel(): string
    abstract getSettings(): any
    abstract getPreviewCode(): string
    abstract getRenderCode(): string
}