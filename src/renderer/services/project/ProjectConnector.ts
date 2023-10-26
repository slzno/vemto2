import Main from "../wrappers/Main"
import Project, { ProjectSettings } from "@Common/models/Project"

export default class ProjectConnector {

    project: Project
    projectSettings: ProjectSettings

    constructor(project: Project) {
        this.project = project
    }

    async connect(settings: ProjectSettings) {
        if(this.project.connectionFinished) {
            return
        }

        await this.createVemtoFolder()
        await this.createNecessaryFiles()
        await this.saveProject(settings)
    }

    async createVemtoFolder() {
        console.log("Creating vemto folder")
        await Main.API.copyInternalFolderIfNotExists("vemto-folder-base", ".vemto")
    }

    async createNecessaryFiles() {
        //
    }

    async saveProject(settings: ProjectSettings) {
        console.log("Saving project settings")

        this.project.settings = settings
        this.project.connectionFinished = true

        await this.project.save()
    }

}