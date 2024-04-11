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

    async saveFromSettings(settings: ProjectSettings) {
        let fileContent = ""

        fileContent += `SCHEMA_READER_MODE=${settings.schemaReaderMode}\n`
        fileContent += `SCHEMA_READER_DB_DRIVER=${settings.schemaReaderDbDriver}\n`
        fileContent += `SCHEMA_READER_DB_HOST=${settings.schemaReaderDbHost}\n`
        fileContent += `SCHEMA_READER_DB_PORT=${settings.schemaReaderDbPort}\n`
        fileContent += `SCHEMA_READER_DB_USERNAME=${settings.schemaReaderDbUsername}\n`
        fileContent += `SCHEMA_READER_DB_PASSWORD=${settings.schemaReaderDbPassword}\n`
        fileContent += `SCHEMA_READER_DB_DATABASE=${settings.schemaReaderDbDatabase}\n`

        await Main.API.writeFile(PathUtil.join(this.path, ".vemto_settings"), fileContent)
    }
}