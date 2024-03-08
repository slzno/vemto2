import path from "path"
import { app } from "electron"
import CommandExecutor from "@Main/base/CommandExecutor"

export default class ReadProjectSchema {

    static run(projectPath: string) {
        const isDevelopment = process.env.NODE_ENV === "development",
            staticFolderPath = isDevelopment ? app.getAppPath() : process.resourcesPath,
            appName = isDevelopment ? "schema-reader.phar" : "VMTTL1"
            
        const apiFilePath = path.join(staticFolderPath, "static", appName)
        
        const command = `php ${apiFilePath}`

        console.log(`Running ${command} on ${projectPath}`)

        return CommandExecutor.executeOnPath(projectPath, command)
    }

}
