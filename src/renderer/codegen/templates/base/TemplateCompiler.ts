import TemplateEngine from "@tiago_silva_pereira/vemto-template-engine"

export default new class TemplateCompiler {

    private data: any
    private imports: any
    private content: string
    private templateEngine: TemplateEngine

    constructor() {
        this.templateEngine = null
    }

    setContent(content: string) {
        this.content = content

        return this
    }

    getContent() {
        return this.content
    }

    setData(data: any) {
        this.data = data

        return this
    }

    getData() {
        return this.data
    }

    importTemplate(template: string, content: string) {
        if (!this.imports) this.imports = {}

        this.imports[template] = content

        return this
    }

    compile() {
        this.startEngine()

        try {
            return this.templateEngine
                .setData(this.data)    
                .compileWithErrorTreatment()
        } catch (error) {
            const latestError = this.templateEngine.getLatestError()
            
            console.error('Error on template line ' + latestError.templateLine)

            throw error
        }
    }

    getTemplateContent() {
        this.startEngine()
        
        return this.templateEngine.getTemplate()
    }

    startEngine() {
        this.templateEngine = new TemplateEngine(this.content, {
            logger: null,
            onBrowser: true,
            imports: this.imports,
        })

        return this 
    }

    getLatestError() {
        if(!this.templateEngine) return

        return this.templateEngine.getLatestError()
    }

    getPreCompiledCode() {
        if(!this.templateEngine) {
            throw new Error('Please compile the code before getting the pre-compiled version')
        }

        return this.templateEngine.getPreCompiledCode()
    }
}