import { padStart } from "lodash"
import Table from "../../../common/models/Table"
import Main from "@Renderer/services/wrappers/Main"
import Project from "../../../common/models/Project"
import PhpFormatter from "../formatters/PhpFormatter"
import TemplateCompiler from "../templates/base/TemplateCompiler"
import MigrationOrganizer from "@Renderer/services/table/MigrationOrganizer"


export default class GenerateNewMigration {
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
        return await this.generateMigration()
    }

    async getData() {
        return {
            name: this.getName(),
            content: await this.getContent(),
        }
    }

    getName(): string {
        const datePrefix = new Date().toISOString().split('T')[0].replace(/-/g, '_'),
            timePrefix = new Date().toISOString().split('T')[1].split('.')[0].replace(/:/g, '')

        const migrationOrganizer = new MigrationOrganizer(this.project)
        
        let migrationOrder = migrationOrganizer.getOrderForTable(this.table)
        migrationOrder = padStart(migrationOrder, 3, '0')

        if(this.table.needsCreationMigration()) {
            return `/database/migrations/${datePrefix}_${timePrefix}_${migrationOrder}_create_${this.table.name}_table.php`
        } 

        if(this.table.wasRenamed()) {
            return `/database/migrations/${datePrefix}_${timePrefix}_${migrationOrder}_rename_${this.table.schemaState.name}_table_to_${this.table.name}.php`
        }

        if(this.table.isRemoved()) {
            return `/database/migrations/${datePrefix}_${timePrefix}_${migrationOrder}_drop_${this.table.schemaState.name}_table.php`
        }

        return `/database/migrations/${datePrefix}_${timePrefix}_${migrationOrder}_update_${this.table.name}_table.php`
    }

    async generateMigration() {
        const fileContent = await this.getContent()

        await Main.API.writeProjectFile(
            this.getName(),
            fileContent
        )

        return fileContent
    }

    async getContent() {
        if(this.table.needsCreationMigration()) {
            return await this.generateCreationMigration()
        } 

        if(this.table.wasRenamed()) {
            return await this.generateRenameMigration()
        }

        if(this.table.isRemoved()) {
            return await this.generateDropMigration()
        }

        return await this.generateUpdaterMigration()
    }

    async generateCreationMigration() {
        const templateCompiler = new TemplateCompiler(), 
            templateContent = await Main.API.readTemplateFile("CreationMigration.vemtl")

        templateCompiler
            .setContent(templateContent)
            .setData({ table: this.table, project: this.project })

        const compiledTemplate = await templateCompiler.compileWithImports()

        return PhpFormatter.setContent(
            compiledTemplate
        ).format()
    }

    async generateRenameMigration() {
        const templateCompiler = new TemplateCompiler(), 
            templateContent = await Main.API.readTemplateFile("RenameMigration.vemtl")

        templateCompiler
            .setContent(templateContent)
            .setData({ table: this.table, project: this.project })

        const compiledTemplate = await templateCompiler.compileWithImports()

        return PhpFormatter.setContent(
            compiledTemplate
        ).format()
    }

    async generateDropMigration() {
        const templateCompiler = new TemplateCompiler(), 
            templateContent = await Main.API.readTemplateFile("DropMigration.vemtl")

        templateCompiler
            .setContent(templateContent)
            .setData({ table: this.table, project: this.project })

        const compiledTemplate = await templateCompiler.compileWithImports()

        return PhpFormatter.setContent(
            compiledTemplate
        ).format()
    }

    async generateUpdaterMigration() {
        const templateCompiler = new TemplateCompiler(),
            templateContent = await Main.API.readTemplateFile("UpdaterMigration.vemtl")

        templateCompiler
            .setContent(templateContent)
            .setData({ table: this.table, project: this.project })

        const compiledTemplate = await templateCompiler.compileWithImports()

        return PhpFormatter.setContent(
            compiledTemplate
        ).format()
    }
}