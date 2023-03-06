import path from "path"
import { app, BrowserWindow } from "electron"
import FileSystem from "./base/FileSystem"
import Project from "../common/models/Project"
import PhpFormatter from "@Renderer/codegen/formatters/PhpFormatter"
import TemplateCompiler from "@Renderer/codegen/templates/base/TemplateCompiler"
import RenderableFile, { RenderableFileStatus, RenderableFileType } from "../common/models/RenderableFile"
import CommandExecutor from "./base/CommandExecutor"

export function HandleRenderableFileQueue(mainWindow: BrowserWindow) {
    let project = null,
        generating = false
    
    setInterval(() => {
        if (generating) return

        project = Project.find(1)

        if(project === null) return

        generateFiles()
    }, 1000)

    const generateFiles = async () => {
        if (project.renderableFiles.length === 0) return

        const pendingFiles = project.renderableFiles.filter(file => file.status === RenderableFileStatus.PENDING)

        if (pendingFiles.length === 0) return

        generating = true

        pendingFiles.forEach(file => {
            processFile(file)
        })

        generating = false
    }

    const processFile = async (file: RenderableFile) => {
        try {
            const completePath = path.join(project.getPath(), ".vemto", "templates", file.template)

            let templateContent = ''

            if(FileSystem.fileExists(completePath)) {
                templateContent = FileSystem.readFile(completePath)
            }

            templateContent = FileSystem.readFile(path.join(app.getAppPath(), "static", "templates", file.template))

            TemplateCompiler
                .setContent(templateContent)
                .setData(file.getDataWithDependencies())

            const compiledContent = await TemplateCompiler.compile()

            const formattedContent = PhpFormatter.setContent(
                compiledContent
            ).format()

            const relativeFilePath = path.join(file.path, file.name),
                projectFilePath = path.join(project.getPath(), relativeFilePath),
                vemtoFilePath = path.join(project.getPath(), ".vemto", "generated-files", relativeFilePath),
                previousFilePath = path.join(project.getPath(), ".vemto", "previous-generated-files", relativeFilePath)
            
            // Write the Vemto version for future comparison or merge
            FileSystem.writeFile(vemtoFilePath, formattedContent)

            const currentFileContent = FileSystem.readFileIfExists(projectFilePath)

            if(file.type === RenderableFileType.PHP_CLASS) {
                const mergedFilePath = await mergeFiles(vemtoFilePath, projectFilePath, previousFilePath)
                
                const mergedFileContent = FileSystem.readFileIfExists(mergedFilePath)

                const formattedMergedFileContent = PhpFormatter.setContent(
                    mergedFileContent
                ).addLineBreaksToParsedContent().format()

                FileSystem.writeFile(projectFilePath, formattedMergedFileContent)

                setFileStatus(file, RenderableFileStatus.RENDERED)

                return true
            }

            if(currentFileContent && currentFileContent !== formattedContent) {
                setFileStatus(file, RenderableFileStatus.CONFLICT)

                return false
            }

            FileSystem.writeFile(projectFilePath, formattedContent)

            setFileStatus(file, RenderableFileStatus.RENDERED)

            return true
        } catch (error) {
            console.log('Error processing file: ', file.name)
            console.log(error)

            setFileStatus(file, RenderableFileStatus.ERROR)
        }
    }

    const mergeFiles = async (newFilePath: string, currentFilePath: string, previousFilePath: string): Promise<string> => {
        const apiFilePath = path.join(app.getAppPath(), "static", "php-merger.phar")

        const command = `php ${apiFilePath} ${newFilePath} ${currentFilePath} ${previousFilePath}`
        
        return CommandExecutor.executeOnPath(project.getPath(), command)
    }

    const setFileStatus = (file: RenderableFile, status: RenderableFileStatus) => {
        mainWindow.webContents.send("model:data:updated", {
            model: "RenderableFile",
            id: file.id,
            data: {
                status: status,
                error: null
            }
        })
    }
}
