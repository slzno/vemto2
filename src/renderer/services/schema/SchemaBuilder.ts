import md5 from "crypto-js/md5"
import Project from "@Common/models/Project";
import Main from "@Renderer/services/wrappers/Main";

export default class SchemaBuilder {

    project: Project
    schemaData: any
    schemaDataHash: string

    constructor(project: Project) {
        this.project = project
    }

    async readData() {
        this.schemaData = await Main.API.loadSchema(this.project.path)

        this.checkSchemaChanges()

        return this
    }

    checkSchemaChanges() {
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

    async build() {
    }

    async buildTables() {
    }

    async buildModels() {
    }

}