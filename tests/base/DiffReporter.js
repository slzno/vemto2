const fs = require('fs')
const open = require('open')
const path = require('path')

class DiffReporter {

    constructor(globalConfig, options) {
        this._options = options
        this._globalConfig = globalConfig
    }

    onTestResult(test, result) {
        if(result.failureMessage) {
            let htmlRegex = /(?<=(TestDiff\())(.*)(?=(\)))/g,
                matches = result.failureMessage.match(htmlRegex)

            if(!matches) return

            let testId = matches[0],
                initialContent = fs.readFileSync(path.join(__dirname, 'templates', 'outputs',  `${testId}_firstFile.txt`)).toString(),
                finalContent = fs.readFileSync(path.join(__dirname, 'templates', 'outputs',  `${testId}_secondFile.txt`)).toString(),
                dataFile = fs.readFileSync(path.join(__dirname, 'templates', 'outputs',  `${testId}_data.json`)).toString(),
                dataContent = JSON.parse(dataFile),
                diffFile = fs.readFileSync(path.join(__dirname, 'templates',  `diff.html`)).toString(),
                diffContent = ''

            diffContent = diffFile.replace('{TEST NAME}', dataContent.testName)
            diffContent = diffContent.replace('{TEMPLATE NAME}', dataContent.templateName)
            diffContent = diffContent.replace('{CONTENT INITIAL}', this.fixTemplateContent(initialContent))
            diffContent = diffContent.replace('{CONTENT FINAL}', this.fixTemplateContent(finalContent))

            let filePath = path.join(__dirname, 'templates', 'outputs', testId + '_diff.html')

            fs.writeFileSync(filePath, diffContent)

            open(filePath)
        }
    }

    fixTemplateContent(content) {
        return content.replace(/<script/gm, '<vscript')
            .replace(/<\/script/gm, '</vscript>')
    }

}

module.exports = DiffReporter