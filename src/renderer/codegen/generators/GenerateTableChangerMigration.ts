import Table from "../../../common/models/Table"
import Project from "../../../common/models/Project"
import PhpFormatter from "../formatters/PhpFormatter"
import TemplateCompiler from "../templates/base/TemplateCompiler"
import Main from "@Renderer/services/wrappers/Main"

export default new class GenerateTableChangerMigration {
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

    async getData() {
        return {
            name: this.getName(),
            content: await this.getContent(),
        }
    }

    getName() {
        const datePrefix = new Date().toISOString().split('T')[0].replace(/-/g, '_'),
            timePrefix = new Date().toISOString().split('T')[1].split('.')[0].replace(/:/g, '')

        return `/database/migrations/${datePrefix}_${timePrefix}_change_${this.table.name}_table.php`
    }

    async generateMigration() {
        const fileContent = await this.getContent()

        Main.API.addFileToGenerationQueue(
            this.getName(),
            fileContent
        )

        return fileContent
    }

    async getContent() {
        const templateCompiler = new TemplateCompiler(),
            templateContent = await Main.API.readTemplateFile("migrations/TableChangerMigration.vemtl")

        templateCompiler
            .setContent(templateContent)
            .setData({ table: this.table, project: this.project })

        const compiledTemplate = await templateCompiler.compileWithImports()

        return PhpFormatter.setContent(
            compiledTemplate
        ).format()
    }
}