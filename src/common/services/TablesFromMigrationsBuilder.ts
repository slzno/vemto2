import Table from "../models/Table"
import Column from "../models/Column"
import Project from "../models/Project"

class TablesFromMigrationsBuilder {
    schemaData: any
    project: Project

    setProject(project: Project) {
        this.project = project
        return this
    }

    setSchemaData(schemaData: any) {
        this.schemaData = schemaData
        return this
    }

    build() {
        this.readTables()
    }

    readTables() {
        Object.keys(this.schemaData).forEach((tableName) => {
            let tableData = this.schemaData[tableName],
                table: Table = null

            if(this.project.doesNotHaveTable(tableName)) {
                table = new Table
                
                table.name = tableData.name
                table.projectId = this.project.id
                table.save()
            } else {
                table = Table.findByName(tableName)
            }

            // this.readColumns(tableData, table)
        })
    }

    readColumns(tableData: any, table: Table) {
        Object.keys(tableData.columns).forEach((columnName: any) => {
            let columnData = tableData.columns[columnName]
            
            console.log(columnData)

            // if(table.hasColumn(columnData.name)) return
            
            // let newColumn = new Column

            // newColumn.name = columnData.name
            // newColumn.tableId = table.id
            // newColumn.typeDefinition = columnData.type
            // newColumn.save()
        })
    }

}

export default new TablesFromMigrationsBuilder