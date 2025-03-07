import Project from "@Common/models/Project"
import Main from "@Renderer/services/wrappers/Main"
import { RenderableFileStatus, RenderableFileType } from "@Common/models/RenderableFile"
import PhpFormatter from "@Renderer/codegen/formatters/PhpFormatter"
import DataHelper from "@Common/models/services/DataHelper"
import Renderable from "../foundation/Renderable"

export default class GenerateTranslations {
    project: Project

    async start() {
        // IMPORTANT: this service can only run in generate mode
        if(Renderable.isCheckerMode()) {
            return
        }

        this.project = Project.find(1)
        await this.generateTranslationsFiles()
    }

    async generateTranslationsFiles() {
        const translations = this.project.translations

        for (const language in translations) {
            let filesToWrite = {}

            // Create file contents from keys
            for (const key in translations[language]) {
                const keyParts = key.split('.'),
                    mainKey = keyParts[0],
                    remainingKeyParts = keyParts.slice(1)

                if(!filesToWrite[mainKey]) {
                    filesToWrite[mainKey] = {
                        filePath: `/lang/${language}/${mainKey}.php`,
                        content: {}
                    }
                }

                let currentLevel = filesToWrite[mainKey].content

                remainingKeyParts.forEach((part, index) => {
                    if (!currentLevel[part]) {
                        currentLevel[part] = (index === remainingKeyParts.length - 1) ? translations[language][key] : {}
                    }

                    currentLevel = currentLevel[part]
                })

                filesToWrite[mainKey].content = DataHelper.cloneObject(filesToWrite[mainKey].content)
            }

            // Write files for this language
            Object.keys(filesToWrite).forEach(async mainKey => {
                const filePath = filesToWrite[mainKey].filePath,
                    fileContents = filesToWrite[mainKey].content

                await this.writePHPFile(filePath, fileContents)
            })
        }

    }

    async writePHPFile(filePath: string, fileContents: any) {
        let fileContentsString = JSON.stringify(fileContents, null, 4)
            .replace(/"([^"]+)":/g, "'$1' =>")

        // replace json { } with php [ ]
        fileContentsString = fileContentsString.replace(/{/g, '[').replace(/}/g, ']')

        let phpContent = `<?php\n\nreturn ${fileContentsString};`

        phpContent = PhpFormatter.setContent(phpContent).format()

        await this.writeFile(filePath, phpContent)
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
