import md5 from "crypto-js/md5"
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
        let t0 = performance.now()
        this.readTables()
        
        let t1 = performance.now()
        console.log(`\x1b[35m%s\x1b[0m`, `Total time read tables ${(t1 - t0).toFixed(2)} ms.`)
    }

    readTables() {
        let schemaDataHash = md5(JSON.stringify(this.schemaData)).toString()

        if (this.project.schemaDataHash === schemaDataHash) {
            console.log('same schema hash')
            return
        }

        this.project.schemaDataHash = schemaDataHash
        this.project.save()

        Object.keys(this.schemaData).forEach((tableName) => {
            let tableData = this.schemaData[tableName],
                table: Table = null

            if(this.project.doesNotHaveTable(tableName)) {
                table = new Table
                table.projectId = this.project.id
            } else {
                table = this.project.findTableByName(tableName)
            }

            table.name = tableData.name
            table.save()

            this.readColumns(tableData, table)
        })
    }

    readColumns(tableData: any, table: Table) {
        Object.keys(tableData.columns).forEach((columnName: any) => {
            let columnData = tableData.columns[columnName],
                column: Column = null
            
            if(table.doesNotHaveColumn(columnName)) {
                column = new Column
                column.tableId = table.id
            } else {
                column = table.findColumnByName(columnName)
            }

            column.name = columnData.name
            column.tableId = table.id
            column.typeDefinition = columnData.type
            column.save()
        })
    }

}

export default new TablesFromMigrationsBuilder