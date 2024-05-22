import path from "path"
import { app } from "electron"
import CommandExecutor from "@Main/base/CommandExecutor"

export default class ReadPhpInfo {

    static async run() {
        const isDevelopment = process.env.NODE_ENV === "development",
            staticFolderPath = isDevelopment ? app.getAppPath() : process.resourcesPath
            
        const apiFilePath = path.join(staticFolderPath, "static", "VMTTL3")

        const phpIsInstalled = await this.phpIsInstalled()

        if (!phpIsInstalled) {
            return {}
        }

        return await CommandExecutor.executePhpOnPath("", apiFilePath)
    }

    static async phpIsInstalled(): Promise<boolean> {
        try {
            const result = await CommandExecutor.executePhpOnPath("", "--version", true)
            return result.includes("PHP")
        } catch (error) {
            return false
        }
    }

}
