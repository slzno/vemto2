import path from "path"
import { app } from "electron"
import FileSystem from "../base/FileSystem"
import ProjectPathResolver from "@Common/services/ProjectPathResolver"

export default class PrepareProject {

    static async run(projectPath: string) {
        console.log('Preparing project...')

        ProjectPathResolver.setPath(projectPath)

        console.log('Project path set to:', projectPath)

        // TODO: check and copy vemto folder if not exists
    }

    static async copyVemtoFolderIfNotExists(projectPath: string) {
        const localTemplatesPath = path.join(app.getAppPath(), "static", "templates"),
            projectTemplatesPath = path.join(projectPath, ".vemto", "templates")

        FileSystem.makeFolderFromTemplate(projectTemplatesPath, localTemplatesPath)
    }

}
