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

            const compiledContent = await TemplateCompiler.compileWithImports()

            const formattedContent = PhpFormatter.setContent(
                compiledContent
            ).format()

            const relativeFilePath = path.join(file.path, file.name),
                projectFilePath = path.join(project.getPath(), relativeFilePath),
                vemtoFilePath = path.join(project.getPath(), ".vemto", "generated-files", relativeFilePath)

            const currentFileContent = FileSystem.readFileIfExists(projectFilePath)

            if(file.type === RenderableFileType.PHP_CLASS) {
                try {
                    await mergeFiles(vemtoFilePath, projectFilePath)
                    
                    const mergedFileContent = FileSystem.readFileIfExists(
                        path.join(project.getPath(), ".vemto", "processed-files", "php-merge-result.php")
                    )
    
                    console.log(mergedFileContent)
    
                    // FileSystem.writeFile(projectFilePath, mergedFileContent)
                    
                    return true
                } catch (error) {
                    console.log('Tem erro')
                    console.error(error.message)

                    return false
                }
            }

            if(currentFileContent && currentFileContent !== formattedContent) {
                mainWindow.webContents.send("model:data:updated", {
                    model: "RenderableFile",
                    id: file.id,
                    data: {
                        status: RenderableFileStatus.CONFLICT,
                        error: null
                    }
                })

                return false
            }

            FileSystem.writeFile(projectFilePath, formattedContent)
            FileSystem.writeFile(vemtoFilePath, formattedContent)

            mainWindow.webContents.send("model:data:updated", {
                model: "RenderableFile",
                id: file.id,
                data: {
                    status: RenderableFileStatus.RENDERED,
                    error: null
                }
            })

            return true
        } catch (error) {
            mainWindow.webContents.send("model:data:updated", {
                model: "RenderableFile",
                id: file.id,
                data: {
                    status: RenderableFileStatus.ERROR,
                    error: error.message
                }
            })
        }
    }

    const mergeFiles = (newFilePath: string, currentFilePath: string) => {
        const apiFilePath = path.join(app.getAppPath(), "static", "php-merger.phar")

        const command = `php ${apiFilePath} ${newFilePath} ${currentFilePath}`
        
        return CommandExecutor.executeOnPath(project.getPath(), command)
    }
}
