import Index from "@Common/models/Index"
import Table from "@Common/models/Table"
import Column from "@Common/models/Column"
import Project from "@Common/models/Project"

export default class TablesBuilder {
    static processing: boolean = false

    project: Project
    schemaTablesData: any

    constructor(project: Project) {
        this.project = project
    }

    reset() {
        this.project = null
        this.schemaTablesData = null
    }

    setSchemaData(schemaData: any) {
        this.schemaTablesData = schemaData.tables

        return this
    }

    async build() {
        if(TablesBuilder.processing) return

        await this.project.undoAllTablesChanges()

        this.processTables()

        return true
    }

    processTables() {
        try {
            TablesBuilder.processing = true
    
            this.readTables()
            this.readTableIndexes()
    
            this.reset()
    
            TablesBuilder.processing = false
        } catch (error) {
            TablesBuilder.processing = false

            throw error   
        }
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
            let table: Table = null,
                isCreating = false

            try {
                let tableData = this.schemaTablesData[tableName]
    
                if(!tablesNames.includes(tableName)) {
                    isCreating = true

                    table = new Table
                    table.projectId = this.project.id
    
                    tablesKeyedByName[tableName] = table
                } else {
                    table = tablesKeyedByName[tableName]
                    table.markAsNotRemoved()
                }
    
                Table.savingInternally()
                table.applyChanges(tableData)
                Table.notSavingInternally()
    
                this.readColumns(tableData, table)
            } catch (error) {
                if(isCreating) {
                    table.delete()
                }

                console.log(`Error processing table ${tableName}`)
                console.error(error)
                return
            }
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
            let column: Column = null,
                isCreating = false

            try {
                let columnData = tableData.columns[columnName]
                
                if(!columnsNames.includes(columnName)) {
                    isCreating = true

                    column = new Column
                    column.tableId = table.id
    
                    columnsKeyedByName[columnName] = column
                } else {
                    column = columnsKeyedByName[columnName]
                    column.markAsNotRemoved()
                }
    
                const columnIsIndex = tableRawIndexes.some((index: any) => index.columns.includes(columnName))
    
                if(columnIsIndex) columnData.index = true
    
                Column.savingInternally()
                column.applyChanges(columnData)
                Column.notSavingInternally()
            } catch (error) {
                if(isCreating) {
                    column.delete()
                }

                console.log(`Error processing column ${columnName}`)
                console.error(error)
                return
            }
        })
    }

    readTableIndexes() {
        const tablesKeyedByName = this.project.getAllTablesKeyedByName()

        Object.keys(this.schemaTablesData).forEach((tableName) => {
            let tableData = this.schemaTablesData[tableName],
                table: Table = tablesKeyedByName[tableName]

            this.readIndexes(tableData, table)
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
            let index: Index = null,
                isCreating = false

            try {
                let indexData = tableData.indexes[indexName]
                
                if(!indexesNames.includes(indexName)) {
                    isCreating = true

                    index = new Index
                    index.tableId = table.id
    
                    indexesKeyedByName[indexName] = index
                } else {
                    index = indexesKeyedByName[indexName]
                    index.markAsNotRemoved()
                }
    
                Index.savingInternally()
                index.applyChanges(indexData)
                Index.notSavingInternally()
            } catch (error) {
                if(isCreating) {
                    index.delete()
                }
                
                console.log(`Error processing index ${indexName}`)
                console.error(error)
                return
            }
        })
    }

}