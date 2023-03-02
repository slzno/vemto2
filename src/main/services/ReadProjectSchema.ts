import path from "path"
import { app } from "electron"
import CommandExecutor from "@Main/base/CommandExecutor"

export default class ReadProjectSchema {

    static run(projectPath: string) {
        const apiFilePath = path.join(app.getAppPath(), "static", "schema-reader.phar")
        
        const command = `php ${apiFilePath}`

        return CommandExecutor.executeOnPath(projectPath, command)
    }

}
