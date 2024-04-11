import path from "path"
import { app } from "electron"
import EnvParser from "@Common/util/EnvParser"
import CommandExecutor from "@Main/base/CommandExecutor"
import FileSystem from "@Main/base/FileSystem"

export default class ReadProjectSchema {

    static async run(projectPath: string) {
        const isDevelopment = process.env.NODE_ENV === "development",
            staticFolderPath = isDevelopment ? app.getAppPath() : process.resourcesPath

        const settingsFileContent = FileSystem.readFile(path.join(projectPath, ".vemto_settings")),
            settings = new EnvParser(settingsFileContent)

        const schemaReaderMode = settings.getKey("SCHEMA_READER_MODE", "db"),
            toolName = schemaReaderMode === "migration" ? "VMTTL1" : "VMTTL2"
            
        const apiFilePath = path.join(staticFolderPath, "static", toolName)

        return await CommandExecutor.executePhpOnPath(projectPath, apiFilePath)
    }

}
