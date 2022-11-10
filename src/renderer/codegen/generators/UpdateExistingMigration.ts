import Table from "../../../common/models/Table"
import Project from "../../../common/models/Project"
import PhpFormatter from "../formatters/PhpFormatter"
import MigrationEditor from "../editors/MigrationEditor"
import TemplateCompiler from "../templates/base/TemplateCompiler"

export default new class UpdateExistingMigration {
    table: Table
    project: Project

    setTable(table: Table) {
        this.table = table
        this.project = table.project
        
        return this
    }

    run() {
        return this.updateLatestMigration()
    }

    async updateLatestMigration() {
        const latestMigration = this.table.getLatestMigration()

        const fileContent = await this.generateLatestMigrationUpdate()

        window.api.addFileToGenerationQueue(
            latestMigration.relativePath,
            fileContent
        )

        this.project.removeTableFromChangedTables(this.table)
    }

    async generateLatestMigrationUpdate() {
        if (this.table.latestMigrationCreatedTable()) {
            return this.changeCreationMigration()
        }

        return this.changeUpdaterMigration()
    }

    async changeCreationMigration() {
        const latestMigration = this.table.getLatestMigration(),
            latestMigrationContent = await window.api.readProjectFile(latestMigration.relativePath),
            creationSchemaTemplate = await window.api.readTemplateFile('CreationSchema.vemtl')

        TemplateCompiler
            .setContent(creationSchemaTemplate)
            .setData({ table: this.table })

        const compiledTemplate = await TemplateCompiler.compileWithImports(),
            migrationEditor = new MigrationEditor(latestMigrationContent)

        migrationEditor.replaceSchemaCreateOnUpMethod(this.table.name, compiledTemplate)

        console.log(migrationEditor.getMigrationContent())

        return PhpFormatter.setContent(
            migrationEditor.getMigrationContent()
        ).format()
    }

    async changeUpdaterMigration() {
        const latestMigration = this.table.getLatestMigration(),
            latestMigrationContent = await window.api.readProjectFile(latestMigration.relativePath),
            columnsTemplate = await window.api.readTemplateFile('UpdaterMigrationColumns.vemtl')

        TemplateCompiler
                .setContent(columnsTemplate)
                .setData({ table: this.table })

        const compiledTemplate = TemplateCompiler.compile(),
            migrationEditor = new MigrationEditor(latestMigrationContent)

        migrationEditor.addContentToSchemaTableOnUpMethod(this.table.name, compiledTemplate)

        return PhpFormatter.setContent(
            migrationEditor.getMigrationContent()
        ).format()
    }
}