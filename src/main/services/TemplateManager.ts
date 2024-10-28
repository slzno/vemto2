import path from "path"
import { app } from "electron"
import Project from "@Common/models/Project"
import FileSystem from "@Main/base/FileSystem"

export default class TemplateManager {
    templatePath: string

    constructor(templatePath: string) {
        this.templatePath = templatePath
    }

    read(): string {
        const project = Project.find(1)

        if(!project) {
            // If there is no project, we read the default template
            return this.readDefaultTemplate()
        }

        const completePath = path.join(project.getPath(), ".vemto", "templates", "base", this.templatePath)

        // If the published file exists in the project, we read it
        if(FileSystem.fileExists(completePath)) {
            return FileSystem.readFile(completePath)
        }

        return this.readDefaultTemplate()
    }

    readDefaultTemplate(): string {
        return FileSystem.readFileIfExists(path.join(app.getAppPath(), "static", "templates", this.templatePath))
    }

    static publishAll() {
        const project = Project.find(1)

        if(!project) return

        const templatePath = path.join(app.getAppPath(), "static", "templates")
        const projectTemplatePath = path.join(project.getPath(), ".vemto", "templates", "base")

        FileSystem.copyFolderIfNotExists(templatePath, projectTemplatePath)
    }
}