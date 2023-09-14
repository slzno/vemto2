import Table from "./Table"
import Column from "./Column"
import IndexColumn from "./IndexColumn"
import DataComparator from "./services/DataComparator"
import DataComparisonLogger from "./services/DataComparisonLogger"
import FillIndexColumns from "./services/indexes/Fillers/FillIndexColumns"
import WordManipulator from "@Common/util/WordManipulator"
import AbstractSchemaModel from "./composition/AbstractSchemaModel"

import { uniq } from 'lodash'

export default class Index extends AbstractSchemaModel implements SchemaModel {
    id: string

    on: string
    onTableId: string
    onTable: Table

    name: string
    type: string
    table: Table
    tableId: string
    language: string
    schemaState: any
    removed: boolean
    algorithm: string

    columns: string[]
    indexColumns: Column[]

    references: string
    referencesColumnId: string
    referencesColumn: Column

    onUpdate: string
    onDelete: string

    relationships() {
        return {
            table: () => this.belongsTo(Table),
            onTable: () => this.belongsTo(Table, 'onTableId'),
            referencesColumn: () => this.belongsTo(Column, 'referencesColumnId'),
            indexColumns: () => this.belongsToMany(Column, IndexColumn).cascadeDetach()
        }
    }

    static updating(data: any): any {
        if(!data.referenceColumnId) return data

        const referenceColumn = Column.find(data.referenceColumnId)

        if (!referenceColumn) return data

        if (referenceColumn.name == data.references) {
            return data
        }

        data.references = referenceColumn.name

        return data
    }

    saveFromInterface() {
        this.save()

        this.table.markAsChanged()

        return this
    }

    remove() {
        if (this.isNew()) {
            return this.delete()
        }

        this.removed = true

        this.save()
    }

    isPrimary(): boolean {
        return this.type === "primary"
    }

    isForeign(): boolean {
        return this.type === "foreign"
    }

    isNotForeign(): boolean {
        return !this.isForeign()
    }

    isUnique(): boolean {
        return this.type === "unique"
    }

    isCommon(): boolean {
        return this.type === "index"
    }

    isFullText(): boolean {
        return this.type === "fulltext"
    }

    isSpatial(): boolean {
        return this.type === "spatialIndex"
    }

    isSingleColumn(): boolean {
        return this.columns && this.columns.length === 1
    }

    hasLanguage(): boolean {
        return !!this.language
    }

    hasOnUpdate(): boolean {
        return !!this.onUpdate
    }

    hasOnDelete(): boolean {
        return !!this.onDelete
    }

    isDirty(): boolean {
        return this.hasLocalChanges()
    }

    hasLocalChanges(): boolean {
        if (!this.schemaState) return false

        return this.hasDataChanges(this)
    }

    calculateDefaultName(): string {
        const sortedColumns = this.indexColumns.sort((colOne: Column, colTwo: Column) => colOne.order - colTwo.order),
            columnsNames = sortedColumns.map((column: Column) => column.name).join('_'),
            type = WordManipulator.snakeCase(this.type)

        return `${this.table.name}_${columnsNames}_${type}`.replace(/_{2,}/g, '_')
    }

    hasSchemaChanges(comparisonData: any): boolean {
        if (!this.schemaState) return true
        
        return this.hasDataChanges(comparisonData)
    }

    hasDataChanges(comparisonData: any): boolean {
        const dataComparisonMap = this.dataComparisonMap(comparisonData)

        return Object.keys(dataComparisonMap).some(
            (key) => dataComparisonMap[key]
        )
    }

    logDataComparison(): void {
        console.log("Showing changes for index " + this.id)

        DataComparisonLogger.setInstance(this).log()
    }

    applyChanges(data: any): boolean {
        if (!this.hasSchemaChanges(data)) return false

        this.name = data.name
        this.columns = data.columns
        this.algorithm = data.algorithm
        this.type = data.type
        this.on = data.on
        this.references = data.references
        this.language = data.language
        this.onUpdate = data.onUpdate
        this.onDelete = data.onDelete
        
        this.fillSchemaState()
        
        this.save()
        
        this.calculateInternalData(data)
        
        return true
    }

    calculateInternalData(data: any): void {
        const onTable = this.table.project.findTableByName(data.on)

        if(onTable) {
            this.onTableId = onTable.id
        }

        if(this.isForeign() && this.onTable) {
            const referencesColumn = this.onTable.findColumnByName(data.references)

            if(referencesColumn) {
                this.referencesColumnId = referencesColumn.id
            }
        }

        FillIndexColumns.onIndex(this)

        this.save()
    }

    saveSchemaState() {
        this.fillSchemaState()

        this.save()
    }

    fillSchemaState() {
        this.schemaState = this.buildSchemaState()
    }

    /**
     * The next two methods (buildSchemaState and dataComparisonMap) are extremely 
     * important to keep the state of the schema,
     * and both need to reflect the same data structure to avoid false positives when
     * comparing the data between the schema state and the current state.
     */
    buildSchemaState() {
        return {
            name: this.name,
            columns: this.columns,
            algorithm: this.algorithm,
            type: this.type,
            on: this.on,
            references: this.references,
            language: this.language,
            onUpdate: this.onUpdate,
            onDelete: this.onDelete,
        }
    }

    dataComparisonMap(comparisonData: any) {
        return {
            columns: DataComparator.arraysAreDifferent(
                this.schemaState.columns,
                comparisonData.columns
            ),
            algorithm: DataComparator.stringsAreDifferent(
                this.schemaState.algorithm,
                comparisonData.algorithm
            ),
            type: DataComparator.stringsAreDifferent(
                this.schemaState.type,
                comparisonData.type
            ),
            references: DataComparator.stringsAreDifferent(
                this.schemaState.references,
                comparisonData.references
            ),
            on: DataComparator.stringsAreDifferent(
                this.schemaState.on,
                comparisonData.on
            ),
            language: DataComparator.stringsAreDifferent(
                this.schemaState.language,
                comparisonData.language
            ),
            onUpdate: DataComparator.stringsAreDifferent(
                this.schemaState.onUpdate,
                comparisonData.onUpdate
            ),
            onDelete: DataComparator.stringsAreDifferent(
                this.schemaState.onDelete,
                comparisonData.onDelete
            ),
        }
    }

    /**
     * The following method defines propertis that cannot be touched by the application without
     * enabling the isSavingInternally flag. It prevents the application from saving data
     * that is not supposed to be saved. The schemaState property is always protected when isSavingInternally
     * is disabled, even if the property is not defined here. The main reason for this is that some properties
     * can only be changed when reading the schema state from the application code, and never from the Vemto's
     * interface.
     * @returns {string[]}
     */
    static nonTouchableProperties(): string[] {
        return []
    }

    hasColumn(column: string): boolean {
        return this.columns.includes(column)
    }

    getForeignTable(): Table {
        return this.table.project.findTableByName(this.on)
    }

    old(): Index {
        let oldIndex = new Index(this.schemaState)

        oldIndex.tableId = this.tableId

        return oldIndex
    }

    updateColumns(columnsNames: string[]) {
        const uniqueColumnNames = uniq(columnsNames.concat(this.columns))

        uniqueColumnNames.forEach((columnName: string) => {
            const column = this.table.getColumnByName(columnName)

            if(!column) return

            if(columnsNames.includes(columnName)) {
                this.relation('indexColumns').attachUnique(column)
                return
            }

            this.relation('indexColumns').detach(column)
            uniqueColumnNames.splice(uniqueColumnNames.indexOf(columnName), 1)
        })

        this.columns = uniqueColumnNames.filter((columnName: string) => !! columnName)
    
        this.name = this.calculateDefaultName()

        this.save()
    }
}
