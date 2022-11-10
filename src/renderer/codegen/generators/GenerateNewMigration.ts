import Table from "../../../common/models/Table"
import Project from "../../../common/models/Project"
import PhpFormatter from "../formatters/PhpFormatter"
import TemplateCompiler from "../templates/base/TemplateCompiler"

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

        window.api.addFileToGenerationQueue(
            'database/migrations/new_migration.php',
            fileContent
        )

        this.project.removeTableFromChangedTables(this.table)
    }

    async generateUpdaterMigration() {
        const templateContent = await window.api.readTemplateFile("UpdaterMigration.vemtl")

        TemplateCompiler
            .setContent(templateContent)
            .setData({ table: this.table })

        return PhpFormatter.setContent(
            TemplateCompiler.compileWithImports()
        ).format()
    }
}