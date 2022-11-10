import Table from "../../../common/models/Table"
import Project from "../../../common/models/Project"
import PhpFormatter from "../formatters/PhpFormatter"
import TemplateCompiler from "../templates/base/TemplateCompiler"
import Main from "@Renderer/services/wrappers/Main"

export default new class GenerateNewMigration {
    table: Table
    project: Project

    setTable(table: Table) {
        this.table = table
        this.project = table.project
        
        return this
    }

    run() {
        return this.generateMigration()
    }

    async generateMigration() {
        const fileContent = await this.generateUpdaterMigration()

        Main.API.addFileToGenerationQueue(
            'database/migrations/new_migration.php',
            fileContent
        )

        this.project.removeTableFromChangedTables(this.table)
    }

    async generateUpdaterMigration() {
        const templateContent = await Main.API.readTemplateFile("UpdaterMigration.vemtl")

        TemplateCompiler
            .setContent(templateContent)
            .setData({ table: this.table })

        const compiledTemplate = await TemplateCompiler.compileWithImports()

        return PhpFormatter.setContent(
            compiledTemplate
        ).format()
    }
}