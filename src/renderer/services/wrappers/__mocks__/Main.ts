import fs from 'fs'
import path from 'path'

export default new class Main {
    public API: any = null

    constructor() {
        this.API = {
            readTemplateFile: (filePath: string) => {
                return fs.readFileSync(path.join(__dirname, `../../../../main/static/templates/${filePath}`), 'utf8')
            },

            addFileToGenerationQueue: (name: string, content: string) => {
                return true
            },
        }
    }
}