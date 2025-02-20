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

        const publishedPath = path.join(project.getPath(), ".vemto", "templates", "published", this.templatePath),
            customPath = path.join(project.getPath(), ".vemto", "templates", "custom", this.templatePath)

        if(FileSystem.fileExists(customPath)) {
            return "custom"
        }

        if(FileSystem.fileExists(publishedPath)) {
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

        const publishedPath = path.join(project.getPath(), ".vemto", "templates", "published", this.templatePath),
            customPath = path.join(project.getPath(), ".vemto", "templates", "custom", this.templatePath)

        // If the custom file exists in the project, we read it
        if(FileSystem.fileExists(customPath)) {
            return FileSystem.readFile(customPath)
        }

        // If the published file exists in the project, we read it
        if(FileSystem.fileExists(publishedPath)) {
            return FileSystem.readFile(publishedPath)
        }

        return this.readDefault()
    }

    readPublished(): string {
        const project = Project.find(1)

        if(!project) {
            // If there is no project, we read the default template
            return this.readDefault()
        }
        
        const publishedPath = path.join(project.getPath(), ".vemto", "templates", "published", this.templatePath)

        if(FileSystem.fileExists(publishedPath)) {
            return FileSystem.readFile(publishedPath)
        }

        return this.readDefault()
    }

    readDefault(): string {
        return FileSystem.readFileIfExists(path.join(app.getAppPath(), "static", "templates", this.templatePath))
    }

    upgradePublishedTemplate() {
        const project = Project.find(1)

        if(!project) return

        const publishedPath = path.join(project.getPath(), ".vemto", "templates", "published", this.templatePath),
            defaultPath = path.join(app.getAppPath(), "static", "templates", this.templatePath)

        if(FileSystem.fileExists(defaultPath)) {
            FileSystem.copyFile(defaultPath, publishedPath)
        }
    }

    upgradeCustomTemplate() {
        const project = Project.find(1)

        if(!project) return

        const customPath = path.join(project.getPath(), ".vemto", "templates", "custom", this.templatePath),
            defaultPath = path.join(app.getAppPath(), "static", "templates", this.templatePath)

        if(FileSystem.fileExists(defaultPath)) {
            FileSystem.copyFile(defaultPath, customPath)
        }
    }

    static publishAll() {
        const project = Project.find(1)

        if(!project) return

        const templatePath = path.join(app.getAppPath(), "static", "templates")
        const projectTemplatePath = path.join(project.getPath(), ".vemto", "templates", "published")

        FileSystem.copyFolderIfNotExists(templatePath, projectTemplatePath)
    }
}