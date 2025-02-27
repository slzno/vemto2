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
            if (table.isDirty()) {
                table.applyChangesDirectlyToSchemaState()
            }

            table.columns.forEach(column => {
                if (column.isDirty()) {
                    console.log("Applying changes to column: ", column)
                    column.applyChangesDirectlyToSchemaState()
                }
            })
            
            table.indexes.forEach(index => {
                if (index.isDirty()) {
                    index.applyChangesDirectlyToSchemaState()
                }
            })
        })
    }

    updateModels() {
        this.project.models.forEach(model => {
            if (model.isDirty()) {
                model.applyChangesDirectlyToSchemaState()
            }
            
            model.ownRelationships.forEach(relationship => {
                if (relationship.isDirty()) {
                    relationship.applyChangesDirectlyToSchemaState()
                }
            })
        })
    }
}
