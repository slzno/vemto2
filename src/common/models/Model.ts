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
import CastsModelColumn from "./CastsModelColumn"
import FillCastsColumns from "./services/models/Fillers/FillCastsColumns"

import { uniq } from 'lodash'
import { snakeCase } from "change-case"
import Crud from "./crud/Crud"
import TextUtil from "@Common/util/TextUtil"

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
    allImports: string[]

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
            castsColumns: () => this.belongsToMany(Column, CastsModelColumn).cascadeDetach(),
        }
    }

    static creating(modelData: any): any {
        modelData = Model.fixData(modelData)

        return modelData
    }

    static updating(modelData: any): any {
        modelData = Model.fixData(modelData)

        return modelData
    }

    static updated(model: Model): void {
        model.addDeletedAtColumnIfNecessary()
    }

    static fixData(modelData: any): any {
        if(!modelData.methods) modelData.methods = []

        if(!modelData.traits) modelData.traits = []
        if(!modelData.interfaces) modelData.interfaces = []
        if(!modelData.allImports) modelData.allImports = []

        if(!modelData.guarded) modelData.guarded = []
        if(!modelData.fillable) modelData.fillable = []
        if(!modelData.hidden) modelData.hidden = []
        if(!modelData.dates) modelData.dates = []
        if(!modelData.casts) modelData.casts = {}
        if(!modelData.appends) modelData.appends = []

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
        this.generateDefaultSettings()

        if(!this.isAuthenticatable) return
        if(this.name !== 'User') return

        this.callSeeder = false
        this.attributesComments = true
        this.methodsComments = true
    }

    hasNoTable(): boolean {
        return !this.table
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
        this.allImports = data.allImports
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
            appends: DataComparator.cloneArray(this.appends),
            methods: DataComparator.cloneArray(this.methods),
            parentClass: this.parentClass,
            interfaces: DataComparator.cloneArray(this.interfaces),
            traits: DataComparator.cloneArray(this.traits),
            allImports: DataComparator.cloneArray(this.allImports),
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
            allImports: DataComparator.arraysAreDifferent(
                this.schemaState.allImports,
                comparisonData.allImports
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

    isInvalid(): boolean {
        return ! this.isValid()
    }

    isValid(): boolean {
        return !!this.name && this.hasTable() && !this.isRemoved()
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
    
    getBelongsToRelations(): Relationship[] {
        return this.ownRelationships.filter(relationship => relationship.type === 'BelongsTo') || []
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

    isObligatoryParentOfAnotherEntity(model: Model): boolean {
        let hasMany = false

        model.table.columns.forEach((column: Column) => {
            hasMany = column.referencesModel(this) && !column.nullable
        })

        model.getBelongsToRelations().forEach((relation: Relationship) => {
            hasMany = relation.modelId == this.id && !relation.foreignKey.nullable
        })

        return hasMany
    }

    getSelfRelationshipsForeignsNames(): string[] {
        let foreigns = this.getSelfRelationshipsForeigns().map(foreign => {
            return foreign.name
        })

        return [...new Set(foreigns)]
    }

    getSelfRelationshipsForeigns(): Column[] {
        const foreigns = []

        this.getSelfRelationships().forEach((relationship) => {
            foreigns.push(relationship.foreignKey)
        })

        return foreigns
    }

    getSelfRelationships(): Relationship[] {
        return this.ownRelationships.filter((relationship) => relationship.isCommon() && relationship.modelId == this.id)
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

    getPrimaryKeyName(): string {
        const primaryKeyColumn = this.getPrimaryKeyColumn()

        if (!primaryKeyColumn) return 'id'

        return primaryKeyColumn.name
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

    saveCastsColumns(newCastData: any): void {
        const changedColumnId = newCastData[0],
            type = newCastData[1],
            currentColumnId = newCastData[2]

        if(!changedColumnId || !type) return

        const column: Column = this.table.findColumnById(changedColumnId)

        if(!currentColumnId || currentColumnId == changedColumnId) {
            this.attachCastsColumn(column, type)
            return
        }

        const oldColumn = this.table.findColumnById(currentColumnId),
            newColumn: Column = this.table.findColumnById(changedColumnId)

        if(!oldColumn || !newColumn) return

        const pivot = this.relation("castsColumns").getPivotItem(oldColumn)
        
        if(!pivot) return

        pivot.columnId = changedColumnId
        pivot.type = type
        pivot.save()

        delete this.casts[oldColumn.name]
        
        this.casts[newColumn.name] = type
        this.save()
    }

    attachCastsColumn(column: Column, type: string): void {
        let pivot: CastsModelColumn = this.relation("castsColumns").getPivotItem(column)

        if(!pivot) {
            pivot = this.relation("castsColumns").attachUnique(column)
        }

        pivot.type = type
        pivot.save()

        this.casts[column.name] = type
        this.save()
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


    methodNotPresentInSomeHook(method: any): boolean {
        return !this.methodPresentInSomeHook(method)
    }

    methodPresentInSomeHook(method: any): boolean {
        return this.contentPresentInSomeHook(`function ${method.name}`)
    }

    contentNotPresentInSomeHook(content: string): boolean {
        return !this.contentPresentInSomeHook(content)
    }

    contentPresentInSomeHook(content: string): boolean {
        const absoluteContent = TextUtil.absolute(content),
            absoluteHooksContent = TextUtil.absolute(this.getAllHooksContent())

        return absoluteHooksContent.includes(absoluteContent)
    }

    getAllHooksContent(): string {
        const hooks = this.hooks || {}

        let allHooksContent = ''

        for (let key in hooks) {
            const hook = hooks[key] || {}

            for (let hookName in hook) {
                allHooksContent += hook[hookName] || ''
            }
        }

        return allHooksContent
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
        return this.interfaces ? this.interfaces.filter((interfaceName) => !!interfaceName) : []
    }

    hasTraits(): boolean {
        return this.traits && this.traits.length > 0
    }

    getTraits(): string[] {
        return this.traits ? this.traits.filter((trait) => !!trait) : []
    }

    hasOtherImports(): boolean {
        return this.getOtherImports().length > 0
    }

    getOtherImports(): string[] {
        return this.allImports.filter((importName) => {
            return !this.traits.includes(importName) 
                && !this.interfaces.includes(importName) 
                && this.parentClass != importName
        }) || []
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

    addDeletedAtColumnIfNecessary() {
        if(this.table.hasColumn('deleted_at') || !this.hasSoftDeletes) return

        const column = new Column({
            name: 'deleted_at',
            type: 'timestamp',
            project: this.project.id,
            tableId: this.table.id,
            nullable: true
        })

        column.save()

        column.sendToBottom()
    }
}
