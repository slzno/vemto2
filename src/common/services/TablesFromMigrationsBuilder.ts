import md5 from "crypto-js/md5"
import Table from "../models/Table"
import Column from "../models/Column"
import Project from "../models/Project"

class TablesFromMigrationsBuilder {
    static processing: boolean = false

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
        if(TablesFromMigrationsBuilder.processing) return
        
        this.readTables()
    }

    readTables() {
        TablesFromMigrationsBuilder.processing = true

        let schemaDataHash = md5(JSON.stringify(this.schemaData)).toString()

        if (this.project.schemaDataHash === schemaDataHash) {
            TablesFromMigrationsBuilder.processing = false
            return
        }

        this.project.schemaDataHash = schemaDataHash
        this.project.save()

        const tablesNames = this.project.getTablesNames(),
            tablesKeyedByName = this.project.getAllTablesKeyedByName()

        Object.keys(this.schemaData).forEach((tableName) => {
            let tableData = this.schemaData[tableName],
                table: Table = null

            if(!tablesNames.includes(tableName)) {
                table = new Table
                table.projectId = this.project.id

                tablesKeyedByName[tableName] = table
            } else {
                table = tablesKeyedByName[tableName]
            }

            table.applyChanges(tableData)

            this.readColumns(tableData, table)
        })

        TablesFromMigrationsBuilder.processing = false
    }

    readColumns(tableData: any, table: Table) {
        const columnsNames = table.getColumnsNames(),
            columnsKeyedByName = table.getAllColumnsKeyedByName()

        Object.keys(tableData.columns).forEach((columnName: any) => {
            let columnData = tableData.columns[columnName],
                column: Column = null
            
            if(!columnsNames.includes(columnName)) {
                column = new Column
                column.tableId = table.id

                columnsKeyedByName[columnName] = column
            } else {
                column = columnsKeyedByName[columnName]
            }

            column.applyChanges(columnData)
        })
    }

}

export default new TablesFromMigrationsBuilder