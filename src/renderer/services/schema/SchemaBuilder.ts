import Project from "@Common/models/Project";
import Main from "@Renderer/services/wrappers/Main";

class SchemaBuilder {

    project: Project
    hasChanges: boolean = false

    constructor(project: Project) {
        this.project = project
    }

    async readData() {
        const schemaData = await Main.API.loadSchema(
            projectStore.project.path
        )


    }

    checkSchemaChanges() {
        return this
    }

    build() {
    }

    buildTables() {
    }

    buildModels() {
    }

}