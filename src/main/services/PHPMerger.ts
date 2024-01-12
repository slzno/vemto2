import path from "path"
import { app } from "electron"
import Project from "@Common/models/Project"
import FileSystem from "@Main/base/FileSystem"
import CommandExecutor from "@Main/base/CommandExecutor"
import BackgroundVemtoFiles from "@Main/base/BackgroundVemtoFiles"

export default class PHPMerger {

    project: Project
    relativePath: string

    newFilePath: string
    currentFilePath: string
    previousFilePath: string
    
    
    newFileContent: string
    currentFileContent: string
    previousFileContent: string


    constructor(project: Project, relativePath: string) {
        this.project = project
        this.relativePath = relativePath

        const generatedFileBasePath = BackgroundVemtoFiles.getGeneratedFileBasePath(this.relativePath)
        this.newFilePath = path.join(this.project.getPath(), generatedFileBasePath)

        this.currentFilePath = path.join(this.project.getPath(), this.relativePath)

        const previousFileBasePath = BackgroundVemtoFiles.getPreviousGeneratedFileBasePath(this.relativePath)
        this.previousFilePath = path.join(this.project.getPath(), previousFileBasePath)

        this.currentFileContent = FileSystem.readFileIfExists(this.currentFilePath) || ''
        this.previousFileContent = FileSystem.readFileIfExists(this.previousFilePath) || ''
    }

    async merge(): Promise<any> {
        const apiFilePath = path.join(app.getAppPath(), "static", "php-merger.phar")

        const command = `php ${apiFilePath} ${this.newFilePath} ${this.currentFilePath} ${this.previousFilePath}`
        
        return await CommandExecutor.executeOnPath(this.project.getPath(), command)
    }

}