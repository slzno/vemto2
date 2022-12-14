import Table from './Table'
import { isEqual } from 'lodash'
import RelaDB from '@tiago_silva_pereira/reladb'

export default class Index extends RelaDB.Model {
    id: string
    name: string
    type: string
    table: Table
    tableId: string
    schemaState: any
    removed: boolean
    algorithm: string
    columns: string[]

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

    isIndex(): boolean {
        return this.type === 'index'
    }

    isFulltext(): boolean {
        return this.type === 'fulltext'
    }

    isSpatial(): boolean {
        return this.type === 'spatialIndex'
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
        return !isEqual(this.schemaState.columns, comparisonData.columns) ||
            this.schemaState.algorithm !== comparisonData.algorithm ||
            this.schemaState.type !== comparisonData.type
    }

    applyChanges(data: any): boolean {
        if(!this.hasSchemaChanges(data)) return false

        this.columns = data.columns
        this.algorithm = data.algorithm
        this.type = data.type

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
}
