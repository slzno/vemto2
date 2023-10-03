import md5 from "crypto-js/md5"
import Project from "@Common/models/Project";
import Main from "@Renderer/services/wrappers/Main";
import TablesBuilder from "./TablesBuilder";
import ModelsBuilder from "./ModelsBuilder";

export default class SchemaBuilder {

    project: Project
    schemaData: any
    schemaDataHash: string

    constructor(project: Project) {
        this.project = project
    }

    async checkSchemaChanges() {
        await this.readData()

        this.schemaDataHash = md5(JSON.stringify(this.schemaData)).toString()

        if(this.project.lastReadSchemaDataHash !== this.schemaDataHash) {
            this.project.lastReadSchemaDataHash = this.schemaDataHash

            if(this.project.schemaDataHash !== this.schemaDataHash) {
                this.project.canShowSchemaSourceChangesAlert = true
            }

            this.project.save()
        }

        return this
    }

    hasChanges() {
        return this.project.schemaDataHash !== this.schemaDataHash
    }

    async build(tables: boolean = true, models: boolean = true) {
        await this.readData()

        if(tables) await this.buildTables()
        if(models) await this.buildModels()

        await this.updateProjectSettings()

        return this
    }

    async buildTables() {
        if (!this.schemaData) {
            throw new Error('Schema data is not set to build tables')
        }

        const tablesBuilder = new TablesBuilder(this.project)

        tablesBuilder.setSchemaData(this.schemaData)

        return await tablesBuilder.build()
    }

    async buildModels() {
        if (!this.schemaData) {
            throw new Error('Schema data is not set to build models')
        }

        const modelsBuilder = new ModelsBuilder(this.project)

        modelsBuilder.setSchemaData(this.schemaData)

        return await modelsBuilder.build()
    }

    async updateProjectSettings() {
        this.project.canShowSchemaSourceChangesAlert = false
        this.project.save()
    }

    async readData() {
        this.schemaData = await Main.API.loadSchema(this.project.path)

        return this
    }

}