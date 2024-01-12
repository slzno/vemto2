import path from "path"
import FileSystem from "./FileSystem"
import Project from "@Common/models/Project"

export default class BackgroundInternalFiles {

    project: Project

    constructor(project: Project) {
        this.project = project
    }

    setProject(project: Project) {
        this.project = project
    }

    async readGeneratedFile(relativePath: string): Promise<string> {
        return FileSystem.readFileIfExists(
            this.getGeneratedFilePath(relativePath)
        )
    }

    async writeGeneratedFile(relativePath: string, content: string): Promise<void> {
        await FileSystem.writeFile(
            this.getGeneratedFilePath(relativePath),
            content
        )
    }

    getGeneratedFilePath(relativePath: string): string {
        const basePath = BackgroundInternalFiles.getGeneratedFileBasePath(relativePath)
        return path.join(this.project.getPath(), basePath)
    }

    static getGeneratedFileBasePath(relativePath: string): string {
        return path.join(".vemto", "generated-files", relativePath)
    }

    async readPreviousGeneratedFile(relativePath: string): Promise<string> {
        return FileSystem.readFileIfExists(
            this.getPreviousGeneratedFilePath(relativePath)
        )
    }

    async writePreviousGeneratedFile(relativePath: string, content: string): Promise<void> {
        await FileSystem.writeFile(
            this.getPreviousGeneratedFilePath(relativePath),
            content
        )
    }

    getPreviousGeneratedFilePath(relativePath: string): string {
        const basePath = BackgroundInternalFiles.getPreviousGeneratedFileBasePath(relativePath)
        return path.join(this.project.getPath(), basePath)
    }

    static getPreviousGeneratedFileBasePath(relativePath: string): string {
        return path.join(".vemto", "previous-generated-files", relativePath)
    }

    static getDataFileBasePath(): string {
        return path.join(".vemto", "data.json")
    }

    getFileQueueFileBasePath(): string {
        return path.join(".vemto", "file-queue.json")
    }

}