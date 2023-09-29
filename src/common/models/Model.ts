import Table from "./Table"
import Column from './Column'
import Project from "./Project"
import Relationship from "./Relationship"
import GuardedModelColumn from './GuardedModelColumn'
import DataComparator from "./services/DataComparator"
import FillableModelColumn from './FillableModelColumn'
import WordManipulator from "@Common/util/WordManipulator"
import TableNameExceptions from "./static/TableNameExceptions"
import DataComparisonLogger from "./services/DataComparisonLogger"
import FillFillableColumns from "./services/models/Fillers/FillFillableColumns"
import FillGuardedColumns from "./services/models/Fillers/FillGuardedColumns"
import AbstractSchemaModel from "./composition/AbstractSchemaModel"

import { uniq } from 'lodash'
import { snakeCase } from "change-case"

export default class Model extends AbstractSchemaModel implements SchemaModel {
    id: string
    name: string
    plural: string
    path: string
    table: Table
    class: string
    namespace: string
    tableId: string
    fileName: string
    schemaState: any
    removed: boolean
    project: Project
    tableName: string
    projectId: string
    createdFromInterface: boolean
    ownRelationships: Relationship[]
    relatedRelationships: Relationship[]

    pluralAndSingularAreSame: boolean

    /**
     * Laravel related properties
     */
    casts: any

    fillable: string[]
    fillableColumns: Column[]

    dates: string[]
    hidden: string[]
    appends: string[]
    methods: string[]

    guarded: string[]
    guardedColumns: Column[]

    hasGuarded: boolean
    hasHidden: boolean
    hasFillable: boolean
    hasTimestamps: boolean
    hasSoftDeletes: boolean

    relationships() {
        return {
            table: () => this.belongsTo(Table),
            project: () => this.belongsTo(Project),
            ownRelationships: () => this.hasMany(Relationship).cascadeDelete(),
            relatedRelationships: () => this.hasMany(Relationship, "relatedModelId").cascadeDelete(),

            fillableColumns: () => this.belongsToMany(Column, FillableModelColumn).cascadeDetach(),
            guardedColumns: () => this.belongsToMany(Column, GuardedModelColumn).cascadeDetach(),
        }
    }

    saveFromInterface() {
        let creating = false

        if (!this.isSaved()) creating = true

        this.createdFromInterface = creating

        this.save()

        return this
    }

    remove() {
        if (this.isNew()) {
            return this.delete()
        }

        this.removed = true

        this.save()
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

    hasLocalChanges(): boolean {
        if (!this.schemaState) return false

        return this.hasDataChanges(this)
    }

    logDataComparison(): void {
        console.log("Showing changes for model " + this.name)

        DataComparisonLogger.setInstance(this).log()
    }

    applyChanges(data: any) {
        if (!this.hasSchemaChanges(data)) return false

        this.name = data.name
        this.fileName = data.fileName
        this.tableName = data.tableName
        this.class = data.class
        this.namespace = data.namespace
        this.path = data.path
        this.casts = data.casts
        this.fillable = data.fillable
        this.guarded = data.guarded
        this.dates = data.dates
        this.hidden = data.hidden
        this.appends = data.appends
        this.methods = data.methods
        this.createdFromInterface = false
        this.hasGuarded = data.hasGuarded
        this.hasHidden = data.hasHidden
        this.hasFillable = data.hasFillable
        this.hasTimestamps = data.hasTimestamps
        this.hasSoftDeletes = data.hasSoftDeletes

        this.fillSchemaState()
        
        this.save()
        
        this.calculateInternalData()

        return true
    }

    calculateInternalData() {
        if (!this.plural) this.calculateDataByName(false)

        const table = this.project.findTableByName(this.tableName)

        if (!table) {
            this.save()
            return
        }

        this.tableId = table.id

        // Depends on a table
        FillFillableColumns.onModel(this)
        FillGuardedColumns.onModel(this)

        this.save()
    }

    getFreeSimilarRelationship(relationship: Relationship): Relationship {
        return this.ownRelationships.find(ownRelationship => { 
            return (relationship.name == ownRelationship.name)
                && (relationship.type == ownRelationship.type)
                && !ownRelationship.inverseId
        })
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
            tableName: this.tableName,
            class: this.class,
            namespace: this.namespace,
            path: this.path,
            casts: this.casts,
            fillable: this.fillable,
            guarded: this.guarded,
            dates: this.dates,
            hidden: this.hidden,
            appends: this.appends,
            methods: this.methods,
            hasGuarded: this.hasGuarded,
            hasHidden: this.hasHidden,
            hasFillable: this.hasFillable,
            hasTimestamps: this.hasTimestamps,
            hasSoftDeletes: this.hasSoftDeletes,
        }
    }

    dataComparisonMap(comparisonData: any) {
        return {
            name: DataComparator.stringsAreDifferent(
                this.schemaState.name,
                comparisonData.name
            ),
            fileName: DataComparator.stringsAreDifferent(
                this.schemaState.fileName,
                comparisonData.fileName
            ),
            tableName: DataComparator.stringsAreDifferent(
                this.schemaState.tableName,
                comparisonData.tableName
            ),
            class: DataComparator.stringsAreDifferent(
                this.schemaState.class,
                comparisonData.class
            ),
            namespace: DataComparator.stringsAreDifferent(
                this.schemaState.namespace,
                comparisonData.namespace
            ),
            path: DataComparator.stringsAreDifferent(
                this.schemaState.path,
                comparisonData.path
            ),
            casts: DataComparator.objectsAreDifferent(
                this.schemaState.casts,
                comparisonData.casts
            ),
            fillable: DataComparator.arraysAreDifferent(
                this.schemaState.fillable,
                comparisonData.fillable
            ),
            dates: DataComparator.arraysAreDifferent(
                this.schemaState.dates,
                comparisonData.dates
            ),
            hidden: DataComparator.arraysAreDifferent(
                this.schemaState.hidden,
                comparisonData.hidden
            ),
            guarded: DataComparator.arraysAreDifferent(
                this.schemaState.guarded,
                comparisonData.guarded
            ),
            appends: DataComparator.arraysAreDifferent(
                this.schemaState.appends,
                comparisonData.appends
            ),
            methods: DataComparator.arraysAreDifferent(
                this.schemaState.methods,
                comparisonData.methods
            ),
            hasGuarded: DataComparator.booleansAreDifferent(
                this.schemaState.hasGuarded,
                comparisonData.hasGuarded
            ),
            hasHidden: DataComparator.booleansAreDifferent(
                this.schemaState.hasHidden,
                comparisonData.hasHidden
            ),
            hasFillable: DataComparator.booleansAreDifferent(
                this.schemaState.hasFillable,
                comparisonData.hasFillable
            ),
            hasTimestamps: DataComparator.booleansAreDifferent(
                this.schemaState.hasTimestamps,
                comparisonData.hasTimestamps
            ),
            hasSoftDeletes: DataComparator.booleansAreDifferent(
                this.schemaState.hasSoftDeletes,
                comparisonData.hasSoftDeletes
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

    static getValid(): Model[] {
        return Model.get().filter((model) => model.isValid())
    }

    isValid(): boolean {
        return this.hasTable()
    }

    hasTable(): boolean {
        return !! this.table
    }

    wasCreatedFromInterface(): boolean {
        return !!this.createdFromInterface
    }

    hasHasManyRelations(): boolean {
        return this.getHasManyRelations().length > 0
    }

    getFirstBelongsToRelation(): Relationship {
        return this.getHasManyRelations()[0]
    }

    getHasManyRelations(): Relationship[] {
        return this.ownRelationships.filter(relationship => relationship.type === 'HasMany') || []
    }

    getRelationshipsNames(): string[] {
        return this.ownRelationships.map((relationship) => relationship.name)
    }

    getAllRelationshipsKeyedByName(): { [key: string]: Relationship } {
        const relationships = {}

        this.ownRelationships.forEach((relationship) => {
            relationships[relationship.name] = relationship
        })

        return relationships
    }

    getRemovedRelationships(): Relationship[] {
        return this.relatedRelationships.filter((relationship) => relationship.isRemoved())
    }

    getValidRelationships(): Relationship[] {
        return this.ownRelationships.filter((relationship) => relationship.isValid())
    }

    getValidOwnRelationships(): Relationship[] {
        return this.ownRelationships.filter((relationship) => relationship.isValid())
    }

    findRelationship(type: string, relatedModelName: string): Relationship {
        return this.ownRelationships.find((relationship) => relationship.type == type 
            && relationship.relatedModelName == relatedModelName
        )
    }

    getPrimaryKeyColumn(): Column {
        if (!this.table) return null
        return this.table.columns.find(column => column.isPrimaryKey())
    }

    getColumnByName(columnName: string): Column {
        if (!this.table) return null
        return this.table.getColumnByName(columnName)
    }

    tableNameIsDifferentFromDefault(): boolean {
        const currentTableName = this.table.name,
            defaultTableName = snakeCase(WordManipulator.pluralize(this.name))

        return currentTableName != defaultTableName
    }

    calculateDataByName(updateClassAndFileName: boolean = true): void {
        if (!this.name) return

        const tableNameExceptions = TableNameExceptions.get()

        if (this.name in tableNameExceptions) {
            let tableNameException = tableNameExceptions[this.name]

            this.plural = tableNameException.plural
        }

        const modelNamePlural = Model.calculatePluralName(this)
        this.plural = modelNamePlural

        if (this.name != modelNamePlural) {
            this.pluralAndSingularAreSame = false
        } else {
            this.pluralAndSingularAreSame = true
        }

        if(!updateClassAndFileName) return
        
        this.class = `${this.namespace}\\${this.name}`
        this.fileName = `${this.name}.php`
    }

    getCommonMorphInverseRelationships(): Relationship[] {
        const commonRelationships = this.getCommonMorphRelatedRelationships(),
            groupedRelationships = [],
            alreadyGroupedMorphs = []

        commonRelationships.forEach(relationship => {
            if(alreadyGroupedMorphs.includes(relationship.morphToName)) return

            groupedRelationships.push(relationship)
            alreadyGroupedMorphs.push(relationship.morphToName)
        })
        
        return groupedRelationships
    }

    getCommonMorphRelatedRelationships(): Relationship[] {
        return this.relatedRelationships.filter((rel: Relationship) => rel.isCommonMorph())
    }

    getMorphedToManyRelatedRelationships(): Relationship[] {
        return this.relatedRelationships.filter((rel: Relationship) => rel.isManyToManyMorph())
    }
    
    static calculatePluralName(modelData: any): string {
        const modelNamePlural = WordManipulator.pluralize(modelData.name)

        if (modelData.name != modelNamePlural) {
            return modelNamePlural
        }

        return `All${modelNamePlural}`
    }

    saveFillableColumns(columnsNames: string[]): void {
        this.saveColumnsProperty(columnsNames, 'fillable', 'fillableColumns')
    }

    saveGuardedColumns(columnsNames: string[]): void {
        this.saveColumnsProperty(columnsNames, 'guarded', 'guardedColumns')
    }

    saveColumnsProperty(
        columnsNames: string[], 
        type: string, 
        relationshipName: string
    ): void {
        const uniqueColumnNames = uniq(columnsNames.concat(this[type]))

        uniqueColumnNames.forEach((columnName: string) => {
            const column = this.table.getColumnByName(columnName)

            if(!column) return

            if(columnsNames.includes(columnName)) {
                this.relation(relationshipName).attachUnique(column)
                return
            }

            this.relation(relationshipName).detach(column)
            uniqueColumnNames.splice(uniqueColumnNames.indexOf(columnName), 1)
        })

        this[type] = uniqueColumnNames.filter((columnName: string) => !! columnName)

        this.save()
    }
}
