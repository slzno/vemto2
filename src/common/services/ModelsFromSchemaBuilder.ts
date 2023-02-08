import md5 from "crypto-js/md5"
import Project from "@Common/models/Project"

class ModelsFromSchemaBuilder {
    static processing: boolean = false

    project: Project
    schemaModelsData: any
    hasLocalChanges: boolean
    schemaModelsDataHash: string

    reset() {
        this.project = null
        this.schemaModelsData = null
        this.hasLocalChanges = false
        this.schemaModelsDataHash = ''
    }

    setProject(project: Project) {
        this.project = project
        return this
    }

    setSchemaData(schemaData: any) {
        this.schemaModelsData = schemaData.models
        return this
    }

    build() {
        if(ModelsFromSchemaBuilder.processing) return

        this.processModels()
    }

    checkSchemaChanges() {
        this.schemaModelsDataHash = md5(JSON.stringify(this.schemaModelsData)).toString()
        
        if (this.project.schemaModelsDataHash === this.schemaModelsDataHash) {
            return
        }

        this.hasLocalChanges = true

        this.project.schemaModelsDataHash = this.schemaModelsDataHash
        this.project.save()

        return this
    }

    force() {
        this.hasLocalChanges = true
        
        return this
    }


    processModels() {
        if(!this.hasLocalChanges) return

        ModelsFromSchemaBuilder.processing = true

        this.readModels()

        this.reset()

        ModelsFromSchemaBuilder.processing = false
    }

    readModels() {
        const modelsNames = this.project.getModelsNames(),
            modelsKeyedByName = this.project.getModelsKeyedByName()

        // Delete models that no longer exist
        modelsNames.forEach((modelName: string) => {
            if(!this.schemaModelsData[modelName]) {
                modelsKeyedByName[modelName].delete()
            }
        })
    }

}

export default new ModelsFromSchemaBuilder