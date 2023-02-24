import path from "path"
import { app, BrowserWindow, ipcMain } from "electron"
import FileSystem from "./base/FileSystem"
import Project from "../common/models/Project"
import PhpFormatter from "@Renderer/codegen/formatters/PhpFormatter"
import TemplateCompiler from "@Renderer/codegen/templates/base/TemplateCompiler"
import RenderableFile, { RenderableFileStatus } from "../common/models/RenderableFile"

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
}
