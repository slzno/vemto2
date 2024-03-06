import path from "path"
import { app } from "electron"
import CommandExecutor from "@Main/base/CommandExecutor"

export default class ReadProjectSchema {

    static run(projectPath: string) {
        const isDevelopment = process.env.NODE_ENV === "development",
            staticFolderPath = isDevelopment ? app.getAppPath() : process.resourcesPath
            
        const apiFilePath = path.join(staticFolderPath, "static", "schema-reader.phar")
        
        const command = `php ${apiFilePath}`

        console.log(`Running ${command} on ${projectPath}`)

        return CommandExecutor.executeOnPath(projectPath, command)
    }

}
