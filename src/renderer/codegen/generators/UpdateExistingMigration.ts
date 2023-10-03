import Table from "../../../common/models/Table"
import Main from "@Renderer/services/wrappers/Main"
import Project from "../../../common/models/Project"
import PhpFormatter from "../formatters/PhpFormatter"
import MigrationEditor from "../editors/MigrationEditor"
import TemplateCompiler from "../templates/base/TemplateCompiler"

export default class UpdateExistingMigration {
    table: Table
    project: Project

    constructor(table: Table) {
        this.setTable(table)
    }

    setTable(table: Table) {
        this.table = table
        this.project = table.project
        
        return this
    }

    async run() {
        return await this.updateLatestMigration()
    }

    async getData() {
        return {
            name: this.getName(),
            content: await this.getContent(),
        }
    }

    getName() {
        return this.table.getLatestMigration().relativePath
    }

    async getContent() {
        return this.generateLatestMigrationUpdate()
    }

    async updateLatestMigration() {
        const latestMigration = this.table.getLatestMigration()

        const fileContent = await this.generateLatestMigrationUpdate()

        await Main.API.writeProjectFile(
            latestMigration.relativePath,
            fileContent
        )

        return fileContent
    }

    async generateLatestMigrationUpdate() {
        if (this.table.latestMigrationCreatedTable()) {
            return this.changeCreationMigration()
        }

        return this.changeUpdaterMigration()
    }

    async changeCreationMigration() {
        const creationMigration = this.table.getCreationMigration(),
            templateCompiler = new TemplateCompiler(),
            creationMigrationContent = await Main.API.readProjectFile(creationMigration.relativePath),
            creationSchemaTemplate = await Main.API.readTemplateFile('CreationSchema.vemtl')

        templateCompiler
            .setContent(creationSchemaTemplate)
            .setData({ table: this.table })

        const compiledTemplate = await templateCompiler.compileWithImports(),
            migrationEditor = new MigrationEditor(creationMigrationContent)

        migrationEditor
            .replaceSchemaCreateOnUpMethod(this.table.getCanonicalName(), compiledTemplate)
            .changeTableOnSchemaDropOnDownMethod(this.table.getCanonicalName(), this.table.name)

        return PhpFormatter.setContent(
            migrationEditor.getMigrationContent()
        ).format()
    }

    async changeUpdaterMigration() {
        const latestMigration = this.table.getLatestUpdaterMigration(),
            templateCompiler = new TemplateCompiler(),
            latestMigrationContent = await Main.API.readProjectFile(latestMigration.relativePath),
            upColumnsTemplate = await Main.API.readTemplateFile('UpdaterMigrationColumns.vemtl'),
            downColumnsTemplate = await Main.API.readTemplateFile('UpdaterMigrationColumnsDown.vemtl')

        templateCompiler
            .setContent(upColumnsTemplate)
            .setData({ table: this.table })

        const migrationEditor = new MigrationEditor(latestMigrationContent)
        
        let compiledTemplate = await templateCompiler.compileWithImports()

        migrationEditor.addContentToSchemaTableOnUpMethod(this.table.name, compiledTemplate)

        templateCompiler
            .setContent(downColumnsTemplate)
            .setData({ table: this.table })

        compiledTemplate = await templateCompiler.compileWithImports()

        migrationEditor.addContentToSchemaTableOnDownMethod(this.table.name, compiledTemplate)

        return PhpFormatter.setContent(
            migrationEditor.getMigrationContent()
        ).format()
    }
}