import path from "path"
import { v4 as uuid } from "uuid"
import { app, BrowserWindow } from "electron"
import FileSystem from "./base/FileSystem"
import Project from "../common/models/Project"
import PhpFormatter from "@Renderer/codegen/formatters/PhpFormatter"
import RenderableFile, { RenderableFileStatus, RenderableFileType } from "../common/models/RenderableFile"
import CommandExecutor from "./base/CommandExecutor"
import TextUtil from "../common/util/TextUtil"

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

            const relativeFilePath = path.join(file.path, file.name),
                projectFilePath = path.join(project.getPath(), relativeFilePath),
                vemtoFilePath = path.join(project.getPath(), ".vemto", "generated-files", relativeFilePath),
                previousFilePath = path.join(project.getPath(), ".vemto", "previous-generated-files", relativeFilePath)
            
            // Write the Vemto version for future comparison or merge
            FileSystem.writeFile(vemtoFilePath, file.content)

            const currentFileContent = FileSystem.readFileIfExists(projectFilePath)

            if(file.type === RenderableFileType.PHP_CLASS) {
                let mergedFileData = await mergeFiles(vemtoFilePath, projectFilePath, previousFilePath)

                if(mergedFileData.status === 'conflict') {
                    setFileStatus(file, RenderableFileStatus.CONFLICT, {
                        conflictFileName: mergedFileData.conflictsFile.name
                    })

                    return false
                }
                
                const mergedFileContent = FileSystem.readFileIfExists(mergedFileData.file.path)

                console.log(mergedFileContent)

                const formattedMergedFileContent = PhpFormatter.setContent(
                    mergedFileContent
                ).addLineBreaksToParsedContent().format()

                writeProjectFile(relativeFilePath, formattedMergedFileContent)

                setFileStatus(file, RenderableFileStatus.RENDERED)

                return true
            }

            if(currentFileContent && currentFileContent !== file.content) {
                const conflictsFileName = TextUtil.random(32) + '.json',
                    conflictsFilePath = path.join(project.getPath(), ".vemto", "conflicts", conflictsFileName)
                
                FileSystem.writeConflictsFile(conflictsFilePath, [
                    {
                        id: uuid(),
                        currentContent: currentFileContent,
                        newContent: file.content,
                    }
                ])

                setFileStatus(file, RenderableFileStatus.CONFLICT, {
                    conflictFileName: conflictsFileName
                })

                return false
            }

            writeProjectFile(relativeFilePath, file.content)

            setFileStatus(file, RenderableFileStatus.RENDERED)

            return true
        } catch (error) {
            console.log('Error processing file: ', file.name)
            console.log(error)

            setFileStatus(file, RenderableFileStatus.ERROR, {
                error: error.message
            })
        }
    }

    const writeProjectFile = (relativeFilePath: string, formattedContent: string) => {
        return FileSystem.writeProjectFile(project.getPath(), relativeFilePath, formattedContent)
    }

    const mergeFiles = async (newFilePath: string, currentFilePath: string, previousFilePath: string): Promise<any> => {
        const apiFilePath = path.join(app.getAppPath(), "static", "php-merger.phar")

        const command = `php ${apiFilePath} ${newFilePath} ${currentFilePath} ${previousFilePath}`
        
        return await CommandExecutor.executeOnPath(project.getPath(), command)
    }

    const setFileStatus = (file: RenderableFile, status: RenderableFileStatus, customData: any = {}) => {
        mainWindow.webContents.send("model:data:updated", {
            model: "RenderableFile",
            id: file.id,
            data: {
                status: status,
                ...customData
            }
        })
    }
}
