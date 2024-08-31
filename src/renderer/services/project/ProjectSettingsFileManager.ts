import Main from "../wrappers/Main"
import PathUtil from "@Common/util/PathUtil"
import { ProjectSettings } from "@Common/models/Project"

export default class ProjectSettingsFileManager {
    path: string

    constructor(path: string) {
        this.path = path
    }

    async fileExists() {
        return await Main.API.projectFileExists(PathUtil.join(this.path, ".vemto_settings"))
    }

    async saveFromSettings(settings: ProjectSettings, isExample: boolean = false) {
        let fileContent = ""

        const dbPassword = isExample ? "" : settings.schemaReaderDbPassword

        fileContent += `SCHEMA_READER_MODE=${settings.schemaReaderMode}\n`
        fileContent += `SCHEMA_READER_DB_DRIVER=${settings.schemaReaderDbDriver}\n`
        fileContent += `SCHEMA_READER_DB_HOST=${settings.schemaReaderDbHost}\n`
        fileContent += `SCHEMA_READER_DB_PORT=${settings.schemaReaderDbPort}\n`
        fileContent += `SCHEMA_READER_DB_USERNAME=${settings.schemaReaderDbUsername}\n`
        fileContent += `SCHEMA_READER_DB_PASSWORD=${dbPassword}\n`
        fileContent += `SCHEMA_READER_DB_DATABASE=${settings.schemaReaderDbDatabase}\n`

        const fileName = isExample ? ".vemto_settings.example" : ".vemto_settings"

        await Main.API.writeFile(PathUtil.join(this.path, fileName), fileContent)

        if(isExample) return
        
        await this.saveFromSettings(settings, true)

        await this.addToGitIgnoreIfNecessary()
    }

    async addToGitIgnoreIfNecessary() {
        const gitIgnorePath = PathUtil.join(this.path, ".gitignore")

        let gitIgnoreContent = await Main.API.readFile(gitIgnorePath)

        if(!gitIgnoreContent) {
            throw new Error("No .gitignore file found in the project")
        }

        if(gitIgnoreContent.includes(".vemto_settings")) return

        gitIgnoreContent += "\n.vemto_settings\n"

        await Main.API.writeFile(gitIgnorePath, gitIgnoreContent)
    }
}