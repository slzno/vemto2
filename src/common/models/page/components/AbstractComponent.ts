import Component from "./interfaces/Component"
import Alert from "@Renderer/components/utils/Alert"
import TemplateEngine from "@tiago_silva_pereira/vemto-template-engine"

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

    hasNestedComponents(): boolean {
        return false
    }

    getNestedComponentsKeys(): string[] {
        return []
    }

    render() {
        const templateEngine = new TemplateEngine(this.getRenderCode(), {
            logger: null,
            onBrowser: true,
            disableImportsProcessing: true,
        })

        try {
            return templateEngine
                .setData(this)    
                .compileWithErrorTreatment()
        } catch (error: any) {
            const latestError = templateEngine.getLatestError()

            console.error(error)
            
            if(latestError) {
                Alert.error('Error on template line ' + latestError.templateLine)
                console.error('Error on template line ' + latestError.templateLine)
                console.log('Data: ', this)
                
                error.hasTemplateError = true
                error.templateLine = latestError.templateLine
            }

            throw error
        }
    }
}