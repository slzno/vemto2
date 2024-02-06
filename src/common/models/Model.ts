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
import HiddenModelColumn from "./HiddenModelColumn"
import FillHiddenColumns from "./services/models/Fillers/FillHiddenColumns"
import DatesModelColumn from "./DatesModelColumn"
import FillDatesColumns from "./services/models/Fillers/FillDatesColumns"
import AppendsModelColumn from "./AppendsModelColumn"
import FillAppendsColumns from "./services/models/Fillers/FillAppendsColumns"
import CastsModelColumn from "./CastsModelColumn"
import FillCastsColumns from "./services/models/Fillers/FillCastsColumns"

import { uniq } from 'lodash'
import { snakeCase } from "change-case"
import Crud from "./crud/Crud"

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
    hooks: any
    hooksWhenSchemaWasRead: any
    pluralAndSingularAreSame: boolean
    cruds: Crud[]

    /**
     * Settings
     */
    callSeeder: boolean
    seederQuantity: number
    attributesComments: boolean
    methodsComments: boolean

    /**
     * PHP related properties
     */
    parentClass: string
    interfaces: string[]
    traits: string[]

    /**
     * Laravel related properties
     */
    methods: string[]

    hasGuarded: boolean
    guarded: string[]
    guardedColumns: Column[]

    hasFillable: boolean
    fillable: string[]
    fillableColumns: Column[]

    hidden: string[]
    hiddenColumns: Column[]

    dates: string[]
    datesColumns: Column[]

    appends: string[]
    appendsColumns: Column[]

    casts: any
    castsColumns: Column[]

    hasTimestamps: boolean
    hasSoftDeletes: boolean

    isAuthenticatable: boolean

    relationships() {
        return {
            table: () => this.belongsTo(Table),
            project: () => this.belongsTo(Project),
            cruds: () => this.hasMany(Crud).cascadeDelete(),
            ownRelationships: () => this.hasMany(Relationship).cascadeDelete(),
            relatedRelationships: () => this.hasMany(Relationship, "relatedModelId").cascadeDelete(),

            fillableColumns: () => this.belongsToMany(Column, FillableModelColumn).cascadeDetach(),
            guardedColumns: () => this.belongsToMany(Column, GuardedModelColumn).cascadeDetach(),
            hiddenColumns: () => this.belongsToMany(Column, HiddenModelColumn).cascadeDetach(),
            datesColumns: () => this.belongsToMany(Column, DatesModelColumn).cascadeDetach(),
            appendsColumns: () => this.belongsToMany(Column, AppendsModelColumn).cascadeDetach(),
            castsColumns: () => this.belongsToMany(Column, CastsModelColumn).cascadeDetach(),
        }
    }

    static creating(modelData: any): any {
        if(!modelData.methods) modelData.methods = []

        if(!modelData.traits) modelData.traits = []
        if(!modelData.interfaces) modelData.interfaces = []

        if(!modelData.guarded) modelData.guarded = []
        if(!modelData.fillable) modelData.fillable = []
        if(!modelData.hidden) modelData.hidden = []
        if(!modelData.dates) modelData.dates = []
        if(!modelData.casts) modelData.casts = {}

        // TODO: cxheck if this is necessary
        // if(!modelData.appends) modelData.appends = []

        return modelData
    }

    saveFromInterface() {
        let creating = false

        if (!this.isSaved()) creating = true

        this.createdFromInterface = creating

        if (creating) {
            this.generateDefaultImports()
            this.generateDefaultSettings()
        }

        this.save()

        return this
    }

    generateDefaultImports() {
        this.parentClass = "Illuminate\\Database\\Eloquent\\Model"
        
        this.traits = [
            "Illuminate\\Database\\Eloquent\\Factories\\HasFactory"
        ]

        this.interfaces = []
    }

    generateDefaultSettings() {
        this.callSeeder = true
        this.seederQuantity = 5
        this.attributesComments = false
        this.methodsComments = false
    }

    generateDefaultData() {
        if(!this.isAuthenticatable) return
        if(this.name !== 'User') return

        this.callSeeder = false
        this.attributesComments = true
        this.methodsComments = true
    }

    remove() {
        if (this.isNew()) {
            return this.delete()
        }

        this.removed = true

        this.save()
    }

    isDirty(): boolean {
        if(this.hasHooksChanges()) return true

        const hasDirtyRelationships = this.ownRelationships.some((relationship) => relationship.isDirty())

        return !this.isRemoved() && (this.hasLocalChanges() || hasDirtyRelationships)
    }

    hasHooksChanges(): boolean {
        const hooks = this.getHooks('model'),
            hooksWhenSchemaWasRead = this.getHooksWhenSchemaWasRead('model')

        const allKeys = new Set([...Object.keys(hooks), ...Object.keys(hooksWhenSchemaWasRead)])

        for (let key of allKeys) {
            const hookValue = hooks[key]
            const prevHookValue = hooksWhenSchemaWasRead[key]

            // Rule 1: Check if both values are considered "empty" and skip to the next key if so
            const bothEmpty = [hookValue, prevHookValue].every(value => value === undefined || value === null || value.trim() === '')
            if (bothEmpty) continue

            // Rule 2: If one of the values is empty and the other is not, or if they are different, return true
            if ((hookValue === undefined || hookValue === null || hookValue.trim() === '') !== (prevHookValue === undefined || prevHookValue === null || prevHookValue.trim() === '') || hookValue !== prevHookValue) {
                return true // Found a difference
            }
        }

        // If no differences are found, consider the objects equal
        return false
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
        this.parentClass = data.parentClass
        this.interfaces = data.interfaces
        this.traits = data.traits
        this.hasGuarded = data.hasGuarded
        this.hasFillable = data.hasFillable
        this.hasTimestamps = data.hasTimestamps
        this.hasSoftDeletes = data.hasSoftDeletes
        this.isAuthenticatable = data.isAuthenticatable

        this.fillSchemaState()
        
        this.save()
        
        this.calculateInternalData()

        return true
    }

    fillHooksForFutureComparison() {
        this.hooksWhenSchemaWasRead = DataComparator.cloneObject(this.hooks)

        this.save()
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
        FillHiddenColumns.onModel(this)
        FillDatesColumns.onModel(this)
        FillAppendsColumns.onModel(this)
        FillCastsColumns.onModel(this)

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
            fileName: this.fileName,
            tableName: this.tableName,
            class: this.class,
            namespace: this.namespace,
            path: this.path,
            casts: DataComparator.cloneObject(this.casts),
            fillable: DataComparator.cloneArray(this.fillable),
            guarded: DataComparator.cloneArray(this.guarded),
            dates: DataComparator.cloneArray(this.dates),
            hidden: DataComparator.cloneArray(this.hidden),

            // TODO: check if it is an array or object and add cloneArray or cloneObject
            appends: this.appends,

            methods: DataComparator.cloneArray(this.methods),
            parentClass: this.parentClass,
            interfaces: DataComparator.cloneArray(this.interfaces),
            traits: DataComparator.cloneArray(this.traits),
            hasGuarded: this.hasGuarded,
            hasFillable: this.hasFillable,
            hasTimestamps: this.hasTimestamps,
            hasSoftDeletes: this.hasSoftDeletes,
            isAuthenticatable: this.isAuthenticatable,
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
            parentClass: DataComparator.stringsAreDifferent(
                this.schemaState.parentClass,
                comparisonData.parentClass
            ),
            interfaces: DataComparator.arraysAreDifferent(
                this.schemaState.interfaces,
                comparisonData.interfaces
            ),
            traits: DataComparator.arraysAreDifferent(
                this.schemaState.traits,
                comparisonData.traits
            ),
            hasGuarded: DataComparator.booleansAreDifferent(
                this.schemaState.hasGuarded,
                comparisonData.hasGuarded
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
            isAuthenticatable: DataComparator.booleansAreDifferent(
                this.schemaState.isAuthenticatable,
                comparisonData.isAuthenticatable
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
        return this.hasTable() && !this.isRemoved()
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

    getFirstCrud(): Crud {
        if(!this.cruds) return null
        
        return this.cruds[0]
    }

    getHasManyRelations(): Relationship[] {
        return this.ownRelationships.filter(relationship => relationship.type === 'HasMany') || []
    }

    getMorphManyRelations(): Relationship[] {
        return this.ownRelationships.filter(relationship => relationship.type === 'MorphMany') || []
    }

    getBelongsToManyRelations(): Relationship[] {
        return this.ownRelationships.filter(relationship => relationship.type === 'BelongsToMany') || []
    }

    getMorphToManyRelations(): Relationship[] {
        return this.ownRelationships.filter(relationship => relationship.type === 'MorphToMany') || []
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

    getRenamedRelationships(): Relationship[] {
        return this.relatedRelationships.filter((relationship) => relationship.wasRenamed())
    }

    isAuthModel() {
        return this.isAuthenticatable
    }

    getValidRelationships(): Relationship[] {
        return this.ownRelationships.filter((relationship) => relationship.isValid())
    }

    getPossibleInverseRelationships(relationship: Relationship): Relationship[] {
        return this.ownRelationships.filter((rel) => rel.maybeInverseOf(relationship))
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

    getClassString(): string {
        return `${this.namespace}\\${this.name}`
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
    
    saveHiddenColumns(columnsNames: string[]): void {
        this.saveColumnsProperty(columnsNames, 'hidden', 'hiddenColumns')
    }

    saveDatesColumns(columnsNames: string[]): void {
        this.saveColumnsProperty(columnsNames, 'dates', 'datesColumns')
    }

    saveAppendsColumns(columnsNames: string[]): void {
        this.saveColumnsProperty(columnsNames, 'appends', 'appendsColumns')
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

    undoAllChanges() {
        this.undoChanges()
        this.undoAllOwnRelationshipsChanges()
    }

    undoAllOwnRelationshipsChanges() {
        this.ownRelationships.forEach(rel => rel.undoChanges())
    }

    getHooks(type: string): any {
        return this.hooks ? this.hooks[type] || {} : {}
    }

    getHooksWhenSchemaWasRead(type: string): any {
        return this.hooksWhenSchemaWasRead ? this.hooksWhenSchemaWasRead[type] || {} : {}
    }

    getHookByName(type: string, name: string): any {
        return this.getHooks(type)[name] || {}
    }

    getHookWhenSchemaWasReadByName(type: string, name: string): any {
        return this.getHooksWhenSchemaWasRead(type)[name] || {}
    }

    saveHooks(type: string, hooks: any) {
        this.hooks = this.hooks || {}
        this.hooks[type] = hooks

        this.save()
    }

    hasParentClass(): boolean {
        return !! this.parentClass
    }

    getParentClass(): string {
        return this.parentClass || ''
    }

    hasInterfaces(): boolean {
        return this.interfaces && this.interfaces.length > 0
    }

    getInterfaces(): string[] {
        return this.interfaces || []
    }

    hasTraits(): boolean {
        return this.traits && this.traits.length > 0
    }

    getTraits(): string[] {
        return this.traits || []
    }

    hasMethods(): boolean {
        return this.methods && this.methods.length > 0
    }

    getMethods(): string[] {
        return this.methods || []
    }

    getImportAlias(importName: string): string {
        if(!importName.includes(' as ')) return importName.split('\\').pop()

        return importName.split(' as ').pop()
    }

    columnIsHiddenForCrudCreation(column: Column): boolean {
        if(column.isHiddenForCrudCreation()) return true

        if(column.name == 'password') return false

        if(!this.hidden) return false

        return this.hidden.includes(column.name)
    }

    getSeederQuantity(): number {
        return this.seederQuantity || 5
    }
}
