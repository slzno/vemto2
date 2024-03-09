import path from "path"
import { app } from "electron"
import CommandExecutor from "@Main/base/CommandExecutor"

export default class ReadProjectSchema {

    static async run(projectPath: string) {
        const isDevelopment = process.env.NODE_ENV === "development",
            staticFolderPath = isDevelopment ? app.getAppPath() : process.resourcesPath
            
        const apiFilePath = path.join(staticFolderPath, "static", "VMTTL1")
        
        const command = `php ${apiFilePath}`

        if(isDevelopment) {
            console.log(`Running ${command} on ${projectPath}`)
        }

        return await CommandExecutor.executeOnPath(projectPath, command)
    }

}
