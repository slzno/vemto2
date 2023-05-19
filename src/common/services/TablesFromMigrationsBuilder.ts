import md5 from "crypto-js/md5"
import Index from "@Common/models/Index"
import Table from "@Common/models/Table"
import Column from "@Common/models/Column"
import Project from "@Common/models/Project"

class TablesFromMigrationsBuilder {
    static processing: boolean = false

    project: Project
    schemaTablesData: any
    hasLocalChanges: boolean
    schemaTablesDataHash: string

    reset() {
        this.project = null
        this.schemaTablesData = null
        this.hasLocalChanges = false
        this.schemaTablesDataHash = ''
    }

    setProject(project: Project) {
        this.project = project
        return this
    }

    hasSchemaChanges() {
        return this.hasLocalChanges
    }
    
    doesNotHaveSchemaChanges() {
        return !this.hasLocalChanges
    }

    setSchemaData(schemaData: any) {
        this.schemaTablesData = schemaData.tables
        return this
    }

    async build() {
        if(TablesFromMigrationsBuilder.processing) return

        this.processTables()
    }

    async checkSchemaChanges() {
        this.schemaTablesDataHash = md5(JSON.stringify(this.schemaTablesData)).toString()
        
        if (this.project.schemaTablesDataHash === this.schemaTablesDataHash) {
            return
        }

        this.hasLocalChanges = true

        this.project.schemaTablesDataHash = this.schemaTablesDataHash
        this.project.save()

        return this
    }

    force() {
        this.hasLocalChanges = true
        
        return this
    }

    processTables() {
        if(!this.hasLocalChanges) return

        TablesFromMigrationsBuilder.processing = true

        this.readTables()

        this.reset()

        TablesFromMigrationsBuilder.processing = false
    }

    readTables() {
        const tablesNames = this.project.getTablesNames(),
            tablesKeyedByName = this.project.getAllTablesKeyedByName()

        // Delete tables that no longer exist
        tablesNames.forEach((tableName) => {
            if (!this.schemaTablesData[tableName]) {
                const table = tablesKeyedByName[tableName]
                table.delete()
            }
        })

        Object.keys(this.schemaTablesData).forEach((tableName) => {
            let tableData = this.schemaTablesData[tableName],
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
            this.readIndexes(tableData, table)
        })
    }

    readColumns(tableData: any, table: Table) {
        const columnsNames = table.getColumnsNames(),
            columnsKeyedByName = table.getAllColumnsKeyedByName()

        // Delete columns that no longer exist
        // This is correct, we need to use the column name, not the schemaState name
        // because the schemaState name is the old name in this case
        columnsNames.forEach((columnName) => {
            if(!tableData.columns[columnName]) {
                columnsKeyedByName[columnName].delete()
            }
        })

        const tableRawIndexes = Object.values(tableData.indexes)

        // Add or update columns
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

            const columnIsIndex = tableRawIndexes.some((index: any) => index.columns.includes(columnName))

            if(columnIsIndex) columnData.index = true

            column.applyChanges(columnData)
        })
    }

    readIndexes(tableData: any, table: Table) {
        const indexesNames = table.getIndexesNames(),
            indexesKeyedByName = table.getAllIndexesKeyedByName()

        // Delete indexes that no longer exist
        // This is correct, we need to use the index name, not the schemaState name
        // because the schemaState name is the old name in this case
        indexesNames.forEach((indexName) => {
            if(!tableData.indexes[indexName]) {
                indexesKeyedByName[indexName].delete()
            }
        })

        // Add or update indexes
        Object.keys(tableData.indexes).forEach((indexName: any) => {
            let indexData = tableData.indexes[indexName],
                index: Index = null
            
            if(!indexesNames.includes(indexName)) {
                index = new Index
                index.tableId = table.id

                indexesKeyedByName[indexName] = index
            } else {
                index = indexesKeyedByName[indexName]
            }

            index.applyChanges(indexData)
        })
    }

}

export default new TablesFromMigrationsBuilder