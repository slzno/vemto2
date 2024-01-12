import path from "path"
import { v4 as uuid } from "uuid"
import Project from "@Common/models/Project"
import FileSystem from "@Main/base/FileSystem"
import TextUtil from "@Common/util/TextUtil"
import BackgroundVemtoFiles from "@Main/base/BackgroundVemtoFiles"

export default class ConflictManager {

    project: Project
    relativePath: string
    currentFilePath: string
    previousFilePath: string
    currentFileContent: string
    previousFileContent: string

    fileContent: string

    constructor(project: Project, relativePath: string) {
        this.project = project
        this.relativePath = relativePath

        this.currentFilePath = path.join(this.project.getPath(), this.relativePath)

        const previousFileBasePath = BackgroundVemtoFiles.getPreviousGeneratedFileBasePath(this.relativePath)
        this.previousFilePath = path.join(this.project.getPath(), previousFileBasePath)

        this.currentFileContent = FileSystem.readFileIfExists(this.currentFilePath) || ''
        this.previousFileContent = FileSystem.readFileIfExists(this.previousFilePath) || ''
    }

    setFileContent(fileContent: string) {
        this.fileContent = fileContent

        return this
    }

    hasConflict(): boolean {
        const userModifiedFile = this.currentFileContent && this.currentFileContent.trim() !== this.previousFileContent.trim(),
            generatedFileIsEqual = this.fileContent.trim() === this.currentFileContent.trim()

        if(userModifiedFile && !generatedFileIsEqual) {
            return true
        }

        return false
    }

    writeConflictFile() {
        const conflictsFileName = TextUtil.random(32) + '.json',
            conflictsFilePath = path.join(this.project.getPath(), ".vemto", "conflicts", conflictsFileName)
        
        FileSystem.writeConflictsFile(conflictsFilePath, [
            {
                id: uuid(),
                currentContent: this.currentFileContent,
                newContent: this.fileContent,
            }
        ])

        return conflictsFileName
    }

}