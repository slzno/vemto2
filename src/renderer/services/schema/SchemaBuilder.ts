import md5 from "crypto-js/md5"
import Project from "@Common/models/Project"
import Main from "@Renderer/services/wrappers/Main"
import TablesBuilder from "./TablesBuilder"
import ModelsBuilder from "./ModelsBuilder"

export default class SchemaBuilder {
    project: Project
    schemaData: any
    schemaDataHash: string

    static checkerInterval: any
    static processing: boolean = false
    static canCheckSchemaChanges: boolean = true

    constructor(project: Project) {
        this.project = project
    }

    hasChanges() {
        return this.project.schemaDataHash !== this.schemaDataHash
    }

    async build(tables: boolean = false, models: boolean = false) {
        await this.readData()

        if (tables) await this.buildTables()
        if (models) await this.buildModels()

        return this
    }

    async buildTables() {
        SchemaBuilder.processing = true

        if (!this.schemaData) {
            await this.readData()
        }

        const tablesBuilder = new TablesBuilder(this.project)

        tablesBuilder.setSchemaData(this.schemaData)

        await tablesBuilder.build()

        await this.updateProjectSettings()

        SchemaBuilder.processing = false

        return this
    }

    async buildModels() {
        SchemaBuilder.processing = true

        if (!this.schemaData) {
            await this.readData()
        }

        const modelsBuilder = new ModelsBuilder(this.project)

        modelsBuilder.setSchemaData(this.schemaData)

        await modelsBuilder.build()

        await this.updateProjectSettings()

        SchemaBuilder.processing = false

        return this
    }

    async updateProjectSettings() {
        this.project.canShowSchemaSourceChangesAlert = false
        this.project.save()
    }

    async readData() {
        this.schemaData = await Main.API.loadSchema(this.project.path)

        return this
    }

    static disableSchemaChangesCheck() {
        SchemaBuilder.canCheckSchemaChanges = false
    }

    static enableSchemaChangesCheck() {
        SchemaBuilder.canCheckSchemaChanges = true
    }

    static checkSchemaChangesContinuously(
        project: Project,
        interval: number = 750
    ) {
        SchemaBuilder.checkerInterval = setInterval(async () => {
            project = project.fresh() // Needs to reload because it loses reference
            await new SchemaBuilder(project).checkSchemaChanges()
        }, interval)

        return this
    }

    static stopCheckingSchemaChanges() {
        if (!SchemaBuilder.checkerInterval) return this

        clearInterval(SchemaBuilder.checkerInterval)

        return this
    }

    async checkSchemaChanges() {
        if (SchemaBuilder.processing) return
        if (!SchemaBuilder.canCheckSchemaChanges) return

        await this.readData()

        this.schemaDataHash = md5(JSON.stringify(this.schemaData)).toString()

        /**
         * If we are ignoring next schema source changes, we should just save the hash and return
         * We do it because we are going to update the schema by saving code from Vemto and we don't want to
         * show the alert
         */
        if (this.project.canIgnoreNextSchemaSourceChanges) {
            this.project.canIgnoreNextSchemaSourceChanges = false
            this.project.lastReadSchemaDataHash = this.schemaDataHash

            this.project.save()

            return this
        }

        if (this.project.lastReadSchemaDataHash !== this.schemaDataHash) {
            this.project.lastReadSchemaDataHash = this.schemaDataHash

            if (this.project.schemaDataHash !== this.schemaDataHash) {
                this.project.canShowSchemaSourceChangesAlert = true
            }

            this.project.save()
        }

        return this
    }
}
