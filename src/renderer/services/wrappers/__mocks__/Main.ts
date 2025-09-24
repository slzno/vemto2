import TestHelper from '@Tests/base/TestHelper'
import fs from 'fs'
import path from 'path'

export default new class Main {
    public API: any = null

    constructor() {
        this.API = {
            readTemplateFile: (filePath: string) => {
                return fs.readFileSync(path.join(__dirname, `../../../../main/static/templates/${filePath}`), 'utf8')
            },

            readProjectFile: (filePath: string) => {
                const testsPath = TestHelper.getCurrentTestsPath()

                if (!testsPath) {
                    throw new Error('Tests path not found')
                }

                const fullPath = path.join(testsPath, 'tests/input', filePath)

                return fs.readFileSync(fullPath, 'utf8')
            },

            writeProjectFile: (filePath: string, content: string) => {
                return true
            },

            addFileToGenerationQueue: (name: string, content: string) => {
                return {
                    name,
                    content,
                }
            },
        }
    }
}