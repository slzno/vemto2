import path from "path"
import { app } from "electron"
import FileSystem from "../base/FileSystem"

export default class PrepareProject {

    static run(projectPath: string) {
        return new Promise((resolve, reject) => {
            const localTemplatesPath = path.join(app.getAppPath(), "static", "templates"),
                projectTemplatesPath = path.join(projectPath, ".vemto", "templates")

            FileSystem.makeFolderFromTemplate(projectTemplatesPath, localTemplatesPath)

            resolve(projectTemplatesPath)
        })
    }

}
