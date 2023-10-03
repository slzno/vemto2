import md5 from "crypto-js/md5"
import Project from "@Common/models/Project";
import Main from "@Renderer/services/wrappers/Main";
import TablesBuilder from "./TablesBuilder";
import ModelsBuilder from "./ModelsBuilder";

export default class SchemaBuilder {

    project: Project
    schemaData: any
    schemaDataHash: string

    static canCheckSchemaChanges: boolean = true

    constructor(project: Project) {
        this.project = project
    }

    hasChanges() {
        return this.project.schemaDataHash !== this.schemaDataHash
    }

    async build(tables: boolean = false, models: boolean = false) {
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

    static disableSchemaChangesCheck() {
        SchemaBuilder.canCheckSchemaChanges = false

        return this
    }

    static enableSchemaChangesCheck() {
        SchemaBuilder.canCheckSchemaChanges = true

        return this
    }

    async checkSchemaChanges() {
        if(!SchemaBuilder.canCheckSchemaChanges) return this

        await this.readData()

        this.schemaDataHash = md5(JSON.stringify(this.schemaData)).toString()

        /**
         * If we are ignoring next schema source changes, we should just save the hash and return
         * We do it because we are going to update the schema by saving code from Vemto and we don't want to
         * show the alert
         */
        if(this.project.canIgnoreNextSchemaSourceChanges) {
            this.project.canIgnoreNextSchemaSourceChanges = false
            this.project.lastReadSchemaDataHash = this.schemaDataHash

            this.project.save()

            return this
        }

        if(this.project.lastReadSchemaDataHash !== this.schemaDataHash) {
            this.project.lastReadSchemaDataHash = this.schemaDataHash
            
            if(this.project.schemaDataHash !== this.schemaDataHash) {
                this.project.canShowSchemaSourceChangesAlert = true
            }

            this.project.save()
        }

        return this
    }

}