import Project from "@Common/models/Project"

export default class BlueprintSchemaUpdater {
    project: Project

    constructor(project: Project) {
        this.project = project
    }

    update() {
        this.updateTables()
        this.updateModels()
    }

    updateTables() {
        this.project.tables.forEach(table => {
            table.applyChangesDirectlyToSchemaState()

            table.columns.forEach(column => {
                column.applyChangesDirectlyToSchemaState()
                column.deleteIfRemoved()
            })
            
            table.indexes.forEach(index => {
                index.applyChangesDirectlyToSchemaState()
                index.deleteIfRemoved()
            })

            table.deleteIfRemoved()
        })
    }

    updateModels() {
        this.project.models.forEach(model => {
            model.applyChangesDirectlyToSchemaState()
            
            model.ownRelationships.forEach(relationship => {
                relationship.applyChangesDirectlyToSchemaState()
                relationship.deleteIfRemoved()
            })

            model.deleteIfRemoved()
        })
    }
}
