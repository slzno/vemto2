import Table from "./Table"
import Project from "./Project"
import Relationship from "./Relationship"
import RelaDB from "@tiago_silva_pereira/reladb"
import { RenderableFileType } from "./RenderableFile"
import DataComparator from "./services/DataComparator"
import WordManipulator from "@Common/util/WordManipulator"
import TableNameExceptions from "./static/TableNameExceptions"
import DataComparisonLogger from "./services/DataComparisonLogger"
import Column from './Column'

export default class Model extends RelaDB.Model implements SchemaModel {
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
    dates: string[]
    hidden: string[]
    appends: string[]
    methods: string[]
    guarded: string[]

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
            relatedRelationships: () =>
                this.hasMany(Relationship, "relatedModelId").cascadeDelete(),
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

    getOldName(): string {
        if (!this.schemaState) return this.name

        return this.schemaState.name
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

        const table = this.project.findTableByName(data.tableName)

        if (table) {
            this.tableId = table.id
        }

        if(!this.plural) {
            this.calculateDataByName(false)
        }

        this.fillSchemaState()

        this.save()

        return true
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

    wasCreatedFromInterface(): boolean {
        return !!this.createdFromInterface
    }

    isNew(): boolean {
        return !this.schemaState
    }

    wasRenamed(): boolean {
        if (!this.schemaState) return false

        return this.schemaState.name !== this.name
    }

    isRemoved(): boolean {
        return !!this.removed
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

    findRelationship(type: string, relatedModelName: string): Relationship {
        return this.ownRelationships.find((relationship) => relationship.type == type 
            && relationship.relatedModelName == relatedModelName
        )
    }

    getPrimaryKeyColumn() {
        return this.table.columns.find(column => column.isPrimaryKey())
    }

    getColumnByName(columnName: string): Column {
        return this.table.getColumnByName(columnName)
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
        return this.ownRelationships.filter((rel: Relationship) => rel.isCommonMorph())
    }
    
    static calculatePluralName(modelData: any): string {
        const modelNamePlural = WordManipulator.pluralize(modelData.name)

        if (modelData.name != modelNamePlural) {
            return modelNamePlural
        }

        return `All${modelNamePlural}`
    }
}
