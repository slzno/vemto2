import md5 from "crypto-js/md5"
import Project from "@Common/models/Project"
import Main from "@Renderer/services/wrappers/Main"
import TablesBuilder from "./TablesBuilder"
import ModelsBuilder from "./ModelsBuilder"
import ProjectManager from "../project/ProjectManager"

export default class SchemaBuilder {
    project: Project
    schemaData: any
    schemaDataHash: string

    static checkerInterval: any
    static processing: boolean = false
    static canCheckSchemaChanges: boolean = true
    static currentlyReadingProjectUuid: string = ""

    constructor(project: Project) {
        this.project = project

        SchemaBuilder.currentlyReadingProjectUuid = project.uuid
    }

    currentOpenProjectIsDifferent() {
        return SchemaBuilder.currentlyReadingProjectUuid !== ProjectManager.getCurrentOpenProjectUuid()
    }

    hasChanges() {
        return this.project.schemaDataHash !== this.schemaDataHash
    }

    static async checkForErrors(projectPath: string) {
        if (!projectPath) return

        try {
            const schemaData = await Main.API.loadSchema(projectPath)

            if(schemaData.error) {
                console.log("Schema data error: ", schemaData.error)
                throw new Error(schemaData.error)
            }
        } catch (error) {
            console.error("Error while checking for schema errors: ", error)
            throw error
        }
    }

    async build(tables: boolean = false, models: boolean = false) {
        try {
            await this.readData()
    
            if(this.schemaDataIsInvalid()) {
                return
            }
    
            console.log("Building schema")
            console.log("Schema data: ", this.schemaData)
    
            if (tables) await this.buildTables()
            if (models) await this.buildModels()
    
            return this
        } catch (error) {
            console.error("Error while building schema: ", error)

            throw error
        }
    }

    async buildTables() {
        try {
            SchemaBuilder.processing = true
    
            if (!this.schemaData) {
                await this.readData()
            }

            if(this.schemaDataIsInvalid()) {
                console.log("Schema data is invalid, stopping tables build")
                return
            }
    
            const tablesBuilder = new TablesBuilder(this.project)
    
            tablesBuilder.setSchemaData(this.schemaData)
    
            await tablesBuilder.build()
    
            await this.updateProjectSettings()
    
            SchemaBuilder.processing = false
    
            return this
        } catch (error) {
            SchemaBuilder.processing = false

            throw error
        }
    }

    async buildModels() {
        try {
            SchemaBuilder.processing = true
    
            if (!this.schemaData) {
                await this.readData()
            }

            if(this.schemaDataIsInvalid()) {
                console.log("Schema data is invalid, stopping models build")
                return
            }
            
            const modelsBuilder = new ModelsBuilder(this.project)
    
            modelsBuilder.setSchemaData(this.schemaData)
    
            await modelsBuilder.build()
    
            await this.updateProjectSettings()
    
            SchemaBuilder.processing = false
    
            return this
        } catch (error) {
            SchemaBuilder.processing = false

            throw error
        }
    }

    async updateProjectSettings() {
        this.project.canShowSchemaSourceChangesAlert = false
        this.project.save()
    }

    async readData(specificPath: string = "") {
        if (this.currentOpenProjectIsDifferent()) {
            this.schemaData = null
            return this
        }

        const path = specificPath || this.project.getPath()

        await SchemaBuilder.checkForErrors(path)

        this.schemaData = await Main.API.loadSchema(path)

        return this
    }

    schemaDataIsInvalid() {
        return !this.schemaDataIsValid()
    }

    schemaDataIsValid() {
        return this.schemaData !== null 
            && this.schemaData !== undefined
            && Object.keys(this.schemaData).length > 0
            && !this.schemaData.error
            && !this.schemaData.stack
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
        if (this.currentOpenProjectIsDifferent()) {
            console.log("Project is different, stop checking schema changes")
            return
        }

        if(ProjectManager.isClosed()) {
            console.log("Project is closed, stopping schema changes check")
            return
        }

        if(!this.project.connectionFinished) {
            console.log("Project connection is not finished, stopping schema changes check")
            return
        }

        if (SchemaBuilder.processing) return
        if (!SchemaBuilder.canCheckSchemaChanges) return
        
        await this.readData()

        if(this.schemaDataIsValid()) {
            this.project.clearCurrentSchemaError()
        } else {
            // If the schema data is not valid, we should stop here
            console.log("Schema data is not valid, stopping schema changes check")
            return
        }

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
