import path from "path"
import { v4 as uuid } from "uuid"
import { app, BrowserWindow } from "electron"
import FileSystem from "./base/FileSystem"
import Project, { ProjectFilesQueueStatus } from "../common/models/Project"
import RenderableFile, { RenderableFileStatus } from "../common/models/RenderableFile"
import ConflictManager from "./services/ConflictManager"
import BackgroundVemtoFiles from "./base/BackgroundVemtoFiles"

export function HandleRenderableFileQueue(mainWindow: BrowserWindow) {
    let project = null,
        generating = false
    
    setInterval(() => {
        if (generating) return

        project = Project.find(1)

        if(project === null) return

        generateOrRemoveFiles()
    }, 1000)

    const generateOrRemoveFiles = async () => {
        if (project.renderableFiles.length === 0) return

        const pendingFiles = project.getAllPendingRenderableFiles()

        if (pendingFiles.length === 0) return

        console.log("Processing files...")

        generating = true

        for (let i = 0; i < pendingFiles.length; i++) {
            const file = pendingFiles[i]

            if(file.canBeRemoved()) {
                await removeFile(file)
                continue
            }

            await processFile(file)
        }

        generating = false

        console.log("Finished processing files")

        updateModelData("Project", project.id, {
            filesQueueStatus: ProjectFilesQueueStatus.IDLE
        })
    }

    const removeFile = async (file: RenderableFile) => {
        const filePath = path.join(project.getPath(), file.getRelativeFilePath())

        FileSystem.deleteFile(filePath)

        setFileStatus(file, RenderableFileStatus.REMOVED)
    }

    const processFile = async (file: RenderableFile) => {
        try {
            const relativeFilePath = path.join(file.path, file.name),
                vemtoFiles = new BackgroundVemtoFiles(project)

            vemtoFiles.writeGeneratedFile(relativeFilePath, file.content)

            const conflictManager = new ConflictManager(project, relativeFilePath)
            conflictManager.setFileContent(file.content)

            if(conflictManager.hasConflict()) {
                const conflictsFileName = conflictManager.writeConflictFile()

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

    const setFileStatus = (file: RenderableFile, status: RenderableFileStatus, customData: any = {}) => {
        updateModelData("RenderableFile", file.id, {
            status: status,
            ...customData
        })
    }

    const updateModelData = (model: string, id: string, data: any) => {
        mainWindow.webContents.send("model:data:updated", {
            model: model,
            id: id,
            data: data
        })
    }
}
