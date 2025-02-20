import path from "path"
import { app } from "electron"
import Project from "@Common/models/Project"
import FileSystem from "@Main/base/FileSystem"

export default class TemplateManager {
    templatePath: string

    constructor(templatePath: string) {
        this.templatePath = templatePath
    }

    getStatus(): string {
        const project = Project.find(1)

        if(!project) return "default"

        const basePath = path.join(project.getPath(), ".vemto", "templates", "base", this.templatePath),
            customPath = path.join(project.getPath(), ".vemto", "templates", "custom", this.templatePath)

        if(FileSystem.fileExists(customPath)) {
            return "custom"
        }

        if(FileSystem.fileExists(basePath)) {
            return "published"
        }

        return "default"
    }

    saveCustom(content: string) {
        const project = Project.find(1)

        if(!project) return

        const customPath = path.join(project.getPath(), ".vemto", "templates", "custom", this.templatePath)

        return FileSystem.writeFile(customPath, content)
    }

    dropCustom() {
        const project = Project.find(1)

        if(!project) return

        const customPath = path.join(project.getPath(), ".vemto", "templates", "custom", this.templatePath)

        return FileSystem.deleteFile(customPath)
    }

    read(): string {
        const project = Project.find(1)

        if(!project) {
            // If there is no project, we read the default template
            return this.readDefault()
        }

        const basePath = path.join(project.getPath(), ".vemto", "templates", "base", this.templatePath),
            customPath = path.join(project.getPath(), ".vemto", "templates", "custom", this.templatePath)

        // If the custom file exists in the project, we read it
        if(FileSystem.fileExists(customPath)) {
            return FileSystem.readFile(customPath)
        }

        // If the published file exists in the project, we read it
        if(FileSystem.fileExists(basePath)) {
            return FileSystem.readFile(basePath)
        }

        return this.readDefault()
    }

    readPublished(): string {
        const project = Project.find(1)

        if(!project) {
            // If there is no project, we read the default template
            return this.readDefault()
        }
        
        const basePath = path.join(project.getPath(), ".vemto", "templates", "base", this.templatePath)

        if(FileSystem.fileExists(basePath)) {
            return FileSystem.readFile(basePath)
        }

        return this.readDefault()
    }

    readDefault(): string {
        return FileSystem.readFileIfExists(path.join(app.getAppPath(), "static", "templates", this.templatePath))
    }

    upgradeBaseTemplate() {
        const project = Project.find(1)

        if(!project) return

        const basePath = path.join(project.getPath(), ".vemto", "templates", "base", this.templatePath),
            defaultPath = path.join(app.getAppPath(), "static", "templates", this.templatePath)

        if(FileSystem.fileExists(defaultPath)) {
            FileSystem.copyFile(defaultPath, basePath)
        }
    }

    static publishAll() {
        const project = Project.find(1)

        if(!project) return

        const templatePath = path.join(app.getAppPath(), "static", "templates")
        const projectTemplatePath = path.join(project.getPath(), ".vemto", "templates", "base")

        FileSystem.copyFolderIfNotExists(templatePath, projectTemplatePath)
    }
}