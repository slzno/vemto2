import path from "path"
import { app, ipcMain, shell, dialog } from "electron"
import FileSystem from "./base/FileSystem"
import { handleError } from "./ErrorHandler"
import Project from "../common/models/Project"
import ReadProjectSchema from "./services/ReadProjectSchema"
import RenderableFile from "../common/models/RenderableFile"
import Terminal from "./base/Terminal"
import ProjectPathResolver from "@Common/services/ProjectPathResolver"
import ConflictManager from "./services/ConflictManager"
import PHPMerger from "./services/PHPMerger"

export function HandleIpcMessages() {
    ipcMain.handle("confirm", (event, message: string) => {
        const dialogResult = dialog.showMessageBoxSync(null, {
            type: 'question',
            message,
            title: 'Confirm',
            buttons: ['Yes', 'No'],
            cancelId: 1,
            defaultId: 0,
        })

        return dialogResult === 0
    })

    ipcMain.handle("dialog:folder:open", async (event) => {
        return handleError(event, async () => {
            const result = await dialog.showOpenDialog(null, {
                properties: ['openDirectory']
            })

            return result.filePaths[0]
        })
    })

    ipcMain.handle("get:project:schema", async (event, projectPath) => {
        return handleError(event, async () => {
            return await ReadProjectSchema.run(projectPath)
        })
    })

    ipcMain.handle("file:read", (event, filePath) => {
        return handleError(event, () => {
            return FileSystem.readFile(filePath)
        })
    })

    ipcMain.handle("folder:exists", (event, folderPath) => {
        return handleError(event, () => {
            return FileSystem.folderExists(folderPath)
        })
    })

    ipcMain.handle("file:project:read", (event, filePath) => {
        const project = Project.find(1)
        if(!project) return null

        return handleError(event, () => {
            const completePath = path.join(project.getPath(), filePath)
            return FileSystem.readFile(completePath)
        })
    })

    ipcMain.handle("file:project:write", (event, filePath, content) => {
        const project = Project.find(1)
        if(!project) return null

        return handleError(event, () => {
            return FileSystem.writeProjectFile(project.getPath(), filePath, content)
        })
    })

    ipcMain.handle("file:template:read", (event, filePath) => {
        const project = Project.find(1)
        if(!project) return null

        return handleError(event, () => {
            const completePath = path.join(project.getPath(), ".vemto", "templates", filePath)

            if(FileSystem.fileExists(completePath)) {
                return FileSystem.readFile(completePath)
            }

            // If the file does not exist in the project, we try to read it from the static folder
            return FileSystem.readFile(path.join(app.getAppPath(), "static", "templates", filePath))
        })
    })

    ipcMain.handle("folder:open", (event, folderPath) => {
        return handleError(event, () => {
            shell.openPath(folderPath)
        })
    })

    ipcMain.handle("folder:open:terminal", (event, folderPath) => {
        return handleError(event, async () => {
            Terminal.open(folderPath)
        })
    })

    ipcMain.handle("file:project:open", (event, fileRelativePath) => {
        const project = Project.find(1)
        if(!project) return null

        return handleError(event, () => {
            const completePath = path.join(project.getPath(), fileRelativePath)
            
            // Open the file in the default editor
            shell.openPath(completePath)
        })
    })

    ipcMain.handle("folder:project:open", (event, folderRelativePath) => {
        const project = Project.find(1)
        if(!project) return null

        return handleError(event, () => {
            const completePath = path.join(project.getPath(), folderRelativePath)

            // Open the folder in the default file explorer
            shell.openPath(completePath)
        })
    })

    ipcMain.handle("folder:project:open:terminal", (event, folderRelativePath) => {
        const project = Project.find(1)
        if(!project) return null

        return handleError(event, async () => {
            const completePath = path.join(project.getPath(), folderRelativePath)
            
            Terminal.open(completePath)
        })
    })

    ipcMain.handle("file:has:conflicts", (event, relativePath, newContent) => {
        const project = Project.find(1)
        if(!project) return null

        return handleError(event, () => {
            const conflictsManager = new ConflictManager(project, relativePath)
            conflictsManager.setFileContent(newContent)

            return conflictsManager.hasConflict()
        })
    })

    ipcMain.handle("file:conflicts:read", (event, filePath) => {
        const project = Project.find(1)
        if(!project) return null

        return handleError(event, () => {
            const completePath = path.join(project.getPath(), ".vemto", "conflicts", filePath)

            if(FileSystem.fileExists(completePath)) {
                return FileSystem.readFile(completePath)
            }
            
            return null
        })
    })

    ipcMain.handle("file:conflicts:solve:replace", (event, fileId, conflictId, content) => {
        const project = Project.find(1)
        if(!project) return null

        return handleError(event, () => {
            const renderableFile = RenderableFile.find(fileId)

            if(!renderableFile) return null

            const conflictsPath = path.join(project.getPath(), ".vemto", "conflicts", renderableFile.conflictFileName)

            const conflictsFileContent = FileSystem.readFileIfExists(conflictsPath)

            if(!conflictsFileContent) return null

            const conflictsData = JSON.parse(conflictsFileContent)

            const conflict = conflictsData.conflicts.find(c => c.id === conflictId)

            if(!conflict) return null

            const filePath = path.join(project.getPath(), renderableFile.getRelativeFilePath())
            const fileContent = FileSystem.readFileIfExists(filePath)

            if(!fileContent) return null

            const newFileContent = fileContent.replace(conflict.currentContent, content)

            FileSystem.writeProjectFile(project.getPath(), renderableFile.getRelativeFilePath(), newFileContent)

            // Remove the conflict from the conflicts file
            const newConflicts = conflictsData.conflicts.filter(c => c.id !== conflictId)

            conflictsData.conflicts = newConflicts

            FileSystem.writeFile(conflictsPath, JSON.stringify(conflictsData, null, 4))

            return true
        })
    })

    ipcMain.handle("folder:project:read", (event, folderPath, removeBasePath) => {
        const project = Project.find(1)
        if(!project) return null

        return handleError(event, () => {
            const completePath = path.join(project.getPath(), folderPath)

            return FileSystem.readFolder(completePath, removeBasePath)
        })
    })

    ipcMain.handle("folder:project:clear", (event, folderPath) => {
        const project = Project.find(1)
        if(!project) return null

        return handleError(event, () => {
            const completePath = path.join(project.getPath(), folderPath)

            return FileSystem.clearFolder(completePath)
        })
    })

    ipcMain.handle("folder:internal:read", (event, folderPath, removeBasePath) => {
        return handleError(event, () => {
            const completePath = path.join(app.getAppPath(), "static", folderPath)

            return FileSystem.readFolder(completePath, removeBasePath)
        })
    })

    ipcMain.handle("folder:internal:copy", (event, folderPath, destination) => {
        if(!ProjectPathResolver.hasPath()) {
            console.log('Project path is not set')
            return 
        }

        return handleError(event, () => {
            const completePath = path.join(app.getAppPath(), "static", folderPath),
                completeDestination = path.join(ProjectPathResolver.getPath(), destination)

            return FileSystem.copyFolder(completePath, completeDestination)
        })
    })

    // This is used to copy a folder from Vemto to the project folder, but it only
    // creates the folder if it does not exist in the project
    ipcMain.handle("folder:internal:copy:if-not-exists", (event, folderPath, destination) => {
        if(!ProjectPathResolver.hasPath()) {
            console.log('Project path is not set')
            return 
        }

        return handleError(event, () => {
            const completePath = path.join(app.getAppPath(), "static", folderPath),
                completeDestination = path.join(ProjectPathResolver.getPath(), destination)

            return FileSystem.copyFolderIfNotExists(completePath, completeDestination)
        })
    })

    ipcMain.handle("php:file:merge", (event, relativePath) => {
        const project = Project.find(1)
        if(!project) return null

        return handleError(event, () => {
            const phpMerger = new PHPMerger(project, relativePath)

            return phpMerger.merge()
        })
    })
}
