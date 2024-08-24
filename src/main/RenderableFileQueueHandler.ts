import path from "path"
import { v4 as uuid } from "uuid"
import { app, BrowserWindow } from "electron"
import FileSystem from "./base/FileSystem"
import Project, { ProjectFilesQueueStatus } from "../common/models/Project"
import RenderableFile, { RenderableFileStatus } from "../common/models/RenderableFile"
import ConflictManager from "./services/ConflictManager"
import BackgroundInternalFiles from "./base/BackgroundInternalFiles"

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
        console.log("Will remove file: ", file.getRelativeFilePath())
        
        try {
            if (projectPathIsInvalid()) {
                throw new Error("Project path is invalid or attempt to access a restricted directory")
            }
            
            const resolvedProjectPath = path.resolve(project.getPath()), 
                filePath = path.resolve(
                    path.join(resolvedProjectPath, file.getRelativeFilePath())
                )
    
            console.log("Removing file: ", filePath)
        
            // Ensure the file is within the project directory after resolving any symbolic links
            if (!filePath.startsWith(resolvedProjectPath)) {
                throw new Error("Attempt to access a file outside the project directory")
            }
        
            FileSystem.deleteFile(filePath)
    
            setFileStatus(file, RenderableFileStatus.REMOVED)
        } catch (error) {
            console.log("Error removing file: ", file.getRelativeFilePath())

            throw error
        }
    }
    
    const projectPathIsInvalid = () => {
        const projectPath = project.getPath()
        
        return !projectPath || FileSystem.folderIsRestrict(projectPath)
    }

    const processFile = async (file: RenderableFile) => {
        try {
            const relativeFilePath = path.join(file.path, file.name),
                vemtoFiles = new BackgroundInternalFiles(project)

            vemtoFiles.writeGeneratedFile(relativeFilePath, file.content)

            const conflictManager = new ConflictManager(project, relativeFilePath)
            conflictManager.setFileContent(file.content)

            if(conflictManager.hasConflict() && !file.ignoreConflicts) {
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
