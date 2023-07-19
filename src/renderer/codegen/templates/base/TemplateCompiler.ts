import * as changeCase from "change-case"
import Main from "@Renderer/services/wrappers/Main"
import Alert from "@Renderer/components/utils/Alert"
import TemplateEngine from "@tiago_silva_pereira/vemto-template-engine"
import TextUtil from "@Renderer/../common/util/TextUtil"

export default new class TemplateCompiler {

    private data: any
    private hooks: any
    private imports: any
    private content: string
    private vthemeKeys: any
    private hooksEnabled: boolean
    private templateEngine: TemplateEngine

    constructor() {
        this.vthemeKeys = {}
        this.hooksEnabled = true
        this.templateEngine = null
    }

    setContent(content: string) {
        this.content = content

        return this
    }

    setVthemeKeys(vthemeKeys: any) {
        this.vthemeKeys = vthemeKeys

        return this
    }

    setHooks(hooks: any) {
        this.hooks = hooks

        return this
    }

    enableHooks() {
        this.hooksEnabled = true

        return this
    }

    disableHooks() {
        this.hooksEnabled = false

        return this
    }

    setHooksEnabled(enabled: boolean) {
        this.hooksEnabled = enabled

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

    async compileWithImports() {
        const templates = await this.getTemplates(this.content)

        for(const template of templates) {
            this.importTemplate(template, await Main.API.readTemplateFile(template))
        }

        return this.compile()
    }

    async getTemplates(templateContent) {
        const templateEngine = new TemplateEngine(templateContent, {
            logger: null,
            onBrowser: true,
            disableImportsProcessing: true,
            require: this.getRequireData(),
        })

        let templates = []

        const importedTemplates = templateEngine.getImportedTemplates()

        if (importedTemplates.length) {
            templates = templates.concat(importedTemplates)

            for(const templateName of importedTemplates) {
                const templateContent = await Main.API.readTemplateFile(templateName)
                templates = templates.concat(await this.getTemplates(templateContent))
            }
        }

        return templates
    }

    compile() {
        this.startEngine()

        try {
            let compiledContent = this.templateEngine
                .setData(this.data)    
                .compileWithErrorTreatment()

            if(this.hooksEnabled) {
                compiledContent = this.processHooks(compiledContent)
            }

            if(this.content.includes('vtheme(')) {
                compiledContent = this.processVtheme(compiledContent)
            }

            return compiledContent
        } catch (error: any) {
            const latestError = this.templateEngine.getLatestError()

            console.error(error)
            
            if(latestError) {
                Alert.error('Error on template line ' + latestError.templateLine)
                console.error('Error on template line ' + latestError.templateLine)
                console.log('Data: ', this.data)
                
                console.log('Template Lines: ', TextUtil.getSurroundingLinesFromContent(this.templateEngine.getTemplate(), latestError.templateLine, 6))

                error.hasTemplateError = true
                error.templateLine = latestError.templateLine
            }

            throw error
        }
    }

    processHooks(content: string) {
        if(!this.hooks) return content

        const lines = content.split('\n')

        for(let i = 0; i < lines.length; i++) {
            const line = lines[i]

            if(line.trim().startsWith('// hook:')) {
                const hookName = line.replace('// hook:', '').trim()

                if(this.hooks[hookName]) {
                    lines[i] = this.hooks[hookName]
                } else {
                    lines[i] = ''
                }
            }
        }

        return lines.join('\n')
    }

    processVtheme(content: string) {
        const vthemeKeys = content.match(/vtheme\((.*?)\)/g)

        if(!vthemeKeys) return content

        for(const vthemeKey of vthemeKeys) {
            const key = vthemeKey.replace('vtheme(', '').replace(')', '')
            const value = this.vthemeKeys[key]

            if(value) {
                content = content.replace(vthemeKey, value)
            } else {
                content = content.replace(vthemeKey, "")
            }
        }

        return content
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
            require: this.getRequireData(),
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

    getRequireData() {
        return {
            camelCase: changeCase.camelCase,
            capitalCase: changeCase.capitalCase,
            constantCase: changeCase.constantCase,
            dotCase: changeCase.dotCase,
            headerCase: changeCase.headerCase,
            paramCase: changeCase.paramCase,
            pascalCase: changeCase.pascalCase,
            pathCase: changeCase.pathCase,
            sentenceCase: changeCase.sentenceCase,
            snakeCase: changeCase.snakeCase,
            kebabCase: changeCase.paramCase,
        }
    }
}