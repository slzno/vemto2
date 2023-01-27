import Table from './Table'
import { isEqual } from 'lodash'
import RelaDB from '@tiago_silva_pereira/reladb'

export default class Index extends RelaDB.Model {
    id: string
    on: string
    name: string
    type: string
    table: Table
    tableId: string
    language: string
    schemaState: any
    removed: boolean
    algorithm: string
    columns: string[]
    references: string
    onUpdate: string
    onDelete: string

    static identifier() {
        return 'Index'
    }

    relationships() {
        return {
            table: () => this.belongsTo(Table),
        }
    }

    saveFromInterface() {
        this.save()

        this.table.markAsChanged()

        return this
    }

    remove() {
        if(this.isNew()) {
            return this.delete()
        }

        this.removed = true

        this.save()
    }

    getOldName(): string {
        if(!this.schemaState) return this.name

        return this.schemaState.name
    }

    isPrimary(): boolean {
        return this.type === 'primary'
    }

    isForeign(): boolean {
        return this.type === 'foreign'
    }

    isUnique(): boolean {
        return this.type === 'unique'
    }

    isCommon(): boolean {
        return this.type === 'index'
    }

    isFullText(): boolean {
        return this.type === 'fulltext'
    }

    isSpatial(): boolean {
        return this.type === 'spatialIndex'
    }

    isSingleColumn(): boolean {
        return this.columns && this.columns.length === 1
    }

    hasLanguage(): boolean {
        return !! this.language
    }

    hasOnUpdate(): boolean {
        return !! this.onUpdate
    }

    hasOnDelete(): boolean {
        return !! this.onDelete
    }

    hasLocalChanges(): boolean {
        if(!this.schemaState) return false

        return this.hasDataChanges(this)
    }

    hasSchemaChanges(schemaData: any): boolean {
        if(!this.schemaState) return true 

        return this.hasDataChanges(schemaData)
    }

    hasDataChanges(comparisonData: any): boolean {
        return !isEqual(this.schemaState.columns, comparisonData.columns)
            || this.schemaState.algorithm !== comparisonData.algorithm
            || this.schemaState.type !== comparisonData.type
            || this.schemaState.references !== comparisonData.references
            || this.schemaState.on !== comparisonData.on
            || this.schemaState.language !== comparisonData.language
            || this.schemaState.onUpdate !== comparisonData.onUpdate
            || this.schemaState.onDelete !== comparisonData.onDelete
    }

    applyChanges(data: any): boolean {
        if(!this.hasSchemaChanges(data)) return false

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

        return true
    }

    saveSchemaState() {
        this.fillSchemaState()

        this.save()
    }

    fillSchemaState() {
        this.schemaState = this.buildSchemaState()
    }

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

    isNew(): boolean {
        return !this.schemaState
    }

    wasRenamed(): boolean {
        if(!this.schemaState) return false
        
        return this.schemaState.name !== this.name
    }

    isRemoved(): boolean {
        return !! this.removed
    }

    hasColumn(column: string): boolean {
        return this.columns.includes(column)
    }

    old(): Index {
        let oldIndex = new Index(this.schemaState)

        oldIndex.tableId = this.tableId

        return oldIndex
    }
}
