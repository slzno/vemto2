import Project from "@Common/models/Project"
import Main from "@Renderer/services/wrappers/Main"
import { RenderableFileStatus, RenderableFileType } from "@Common/models/RenderableFile"
import PhpFormatter from "@Renderer/codegen/formatters/PhpFormatter"

export default class GenerateTranslations {
    project: Project

    async start() {
        this.project = Project.find(1)
        await this.generateTranslationsFiles()
    }

    async generateTranslationsFiles() {
        const translations = this.project.translations

        for (const language in translations) {
            let filePath = `/lang/${language}/`
            let fileContents = {}
    
            for (const key in translations[language]) {
                const keyParts = key.split('.')

                if (keyParts.length <= 1) {
                    continue
                }

                const fileName = keyParts.shift()

                if (!filePath.includes(fileName)) {
                    filePath = `${filePath}/${fileName}.php`
                }
    
                let currentLevel = fileContents
    
                keyParts.forEach((part, index) => {
                    if (!currentLevel[part]) {
                        currentLevel[part] = (index === keyParts.length - 1) ? translations[language][key] : {}
                    }

                    currentLevel = currentLevel[part]
                })
            }

            let fileContentsString = JSON.stringify(fileContents, null, 4)
                .replace(/"([^"]+)":/g, "'$1' =>")
                .replace(/"/g, "'")

            // replace json { } with php [ ]
            fileContentsString = fileContentsString.replace(/{/g, '[').replace(/}/g, ']')
    
            let phpContent = `<?php\n\nreturn ${fileContentsString};`

            phpContent = PhpFormatter.setContent(phpContent).format()
    
            await this.writeFile(filePath, phpContent)
        }
    }

    async writeFile(path: string, content: string) {
        await Main.API.writeProjectFile(path, content)

        const fileName = path.split('/').pop(),
            folderPath = path.replace(fileName, '')

        const file = this.project.registerRenderableFile(
            folderPath,
            fileName,
            'NoTemplate', 
            RenderableFileType.PHP,
            RenderableFileStatus.RENDERED
        )

        file.setContent(content)
        file.save()
    }
}
