import path from "path"
import { app } from "electron"
import Project from "@Common/models/Project"
import FileSystem from "@Main/base/FileSystem"

export default class TemplateReader {
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

        const completePath = path.join(project.getPath(), ".vemto", "templates", this.templatePath)

        if(FileSystem.fileExists(completePath)) {
            return FileSystem.readFile(completePath)
        }

        return this.readDefaultTemplate()
    }

    readDefaultTemplate(): string {
        return FileSystem.readFileIfExists(path.join(app.getAppPath(), "static", "templates", this.templatePath))
    }
}