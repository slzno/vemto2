import Model from './Model'
import Column from './Column'
import Table from './Table'
import Project from './Project'
import RelaDB from '@tiago_silva_pereira/reladb'
import DataComparator from './services/DataComparator'
import DataComparisonLogger from './services/DataComparisonLogger'
import CalculateMorphRelationshipsData from './services/relationships/Calculators/CalculateMorphRelationshipsData'
import CalculateCommonRelationshipsData from './services/relationships/Calculators/CalculateCommonRelationshipsData'
import CalculateThroughRelationshipsData from './services/relationships/Calculators/CalculateThroughRelationshipsData'
import CalculateManyToManyRelationshipsData from './services/relationships/Calculators/CalculateManyToManyRelationshipsData'
import FillCommonRelationshipKeys from './services/relationships/Fillers/FillCommonRelationshipKeys'
import WordManipulator from '@Common/util/WordManipulator'

export default class Relationship extends RelaDB.Model implements SchemaModel {
    id: string
    defaultName: string
    usingFirstDefaultName: boolean
    name: string
    type: string
    relatedTableName: string
    relatedModelName: string
    parentTableName: string
    parentModelName: string
    localKeyName: string
    relatedKeyName: string

    //-- BelongsTo, HasMany e HasOne
    foreignKeyName: string
    foreignKeyId: string
    foreignKey: Column

    ownerKeyName: string
    ownerKeyId: string
    ownerKey: Column

    parentKeyId: string
    parentKey: Column

    //-- BelongsToMany
    foreignPivotKeyName: string
    foreignPivotKeyId: string
    foreignPivotKey: Column

    relatedPivotKeyName: string
    relatedPivotKeyId: string
    relatedPivotKey: Column

    pivotTableName: string
    pivotId: string
    pivot: Table

    //-- Morph
    idColumnId: string
    idColumn: Column

    morphType: string
    morphTo: string
    
    typeFieldId: string
    typeField: Column

    //-- HasManyThrough
    firstKeyName: string // relatedModelId

    secondKeyName: string
    throughId: string
    through: Model

    //-- Relationship Models
    
    model: Model
    modelId: string

    relatedModel: Model
    relatedModelId: string

    //-- Inverse Relationship

    inverseId: string
    inverse: Relationship
    
    /**
     * Default properties
    */
    schemaState: any
    removed: boolean
    project: Project
    projectId: string
    createdFromInterface: boolean

    static identifier() {
        return 'Relationship'
    }

    relationships() {
        return {
            inverse: () => this.belongsTo(Relationship, 'inverseId').atMostOne(),
            
            model: () => this.belongsTo(Model),
            project: () => this.belongsTo(Project),
            relatedModel: () => this.belongsTo(Model, 'relatedModelId'),

            // Used in BelongsTo, HasMany and HasOne
            foreignKey: () => this.belongsTo(Column, 'foreignKeyId'),
            ownerKey: () => this.belongsTo(Column, 'ownerKeyId'),
            parentKey: () => this.belongsTo(Column, 'parentKeyId'),

            // Used in BelongsToMany and MorphToMany
            pivot: () => this.belongsTo(Table, 'pivotId'),
            relatedPivotKey: () => this.belongsTo(Column, 'relatedPivotKeyId'),

            // Morphs
            idColumn: () => this.belongsTo(Column, 'idColumnId'),
            typeColumn: () => this.belongsTo(Column, 'typeColumnId'),

            // HasManyThrough
            through: () => this.belongsTo(Model, 'throughId')
        }
    }

    saveFromInterface() {
        let creating = false

        if(!this.isSaved()) creating = true

        this.createdFromInterface = creating

        this.save()

        return this
    }

    remove() {
        if(this.isNew()) {
            return this.delete()
        }
        
        this.removed = true

        this.save()
    }

    static updated(relationship: Relationship) {
        relationship.updateInverse()
    }

    static deleting(relationship: Relationship) {
        if(relationship.foreignKey) {
            relationship.foreignKey.delete()
        }
    }

    updateInverse(): void {
        let inverse = this.inverse

        if(!inverse) return

        if(this.isCommon()) {
            return this.updateCommonInverse(inverse)
        }

        if(this.isManyToMany()) {
            return this.updateManyToManyInverse(inverse)
        }
    }

    updateCommonInverse(inverse: Relationship): void {
        if(inverse.foreignKeyId === this.foreignKeyId && inverse.parentKeyId === this.parentKeyId) return

        inverse.foreignKeyId = this.foreignKeyId
        inverse.parentKeyId = this.parentKeyId
        inverse.save()
    }

    updateManyToManyInverse(inverse: Relationship): void {
        if(inverse.relatedPivotKeyId === this.foreignPivotKeyId && inverse.foreignPivotKeyId === this.relatedPivotKeyId) return

        inverse.relatedPivotKeyId = this.foreignPivotKeyId
        inverse.foreignPivotKeyId = this.relatedPivotKeyId
        inverse.save()
    }

    getOldName(): string {
        if(!this.schemaState) return this.name

        return this.schemaState.name
    }

    hasRelatedModel(): boolean {
        return !! this.relatedModelId
    }

    hasModel(): boolean {
        return !! this.model
    }

    hasType(): boolean {
        return !! this.type
    }

    getTypeCamelCase(): string {
        return WordManipulator.camelCase(this.type)
    }

    hasTypeAndRelatedModel(): boolean {
        return this.hasType() && this.hasRelatedModel()
    }

    calculateDefaultData(): void {
        if(this.isCommon()) {
            CalculateCommonRelationshipsData.setRelationship(this)
                .calculateDefaultData()
            return
        }

        if(this.isManyToMany()) {
            CalculateManyToManyRelationshipsData.setRelationship(this)
                .calculateDefaultData()
            return
        }

        if(this.isMorph()) {
            CalculateMorphRelationshipsData.setRelationship(this)
                .calculateDefaultData()
            return
        }

        if(this.isThrough()) {
            CalculateThroughRelationshipsData.setRelationship(this)
                .calculateDefaultData()
        }
    }

    processAndSave(createInverse: boolean = false): void {
        if(this.isCommon()) {
            CalculateCommonRelationshipsData.setRelationship(this)
                .processAndSave(createInverse)
            return
        }

        if(this.isManyToMany()) {
            CalculateManyToManyRelationshipsData.setRelationship(this)
                .processAndSave(createInverse)
            return
        }

        if(this.isMorph()) {
            CalculateMorphRelationshipsData.setRelationship(this)
                .processAndSave()
            return
        }

        if(this.isThrough()) {
            CalculateThroughRelationshipsData.setRelationship(this)
                .processAndSave()
        }
    }

    getParentModel(): Model {
        if(['BelongsTo'].includes(this.type)) {
            return this.relatedModel
        }
        
        if(['HasMany', 'HasOne'].includes(this.type)) {
            return this.model
        }
    }

    isSingular() {
        return ['BelongsTo', 'HasOne', 'MorphOne'].includes(this.type)
    }

    isCollection() {
        return ['HasMany', 'BelongsToMany', 'MorphMany', 'MorphToMany'].includes(this.type)
    }

    isThrough(): boolean {
        return ['HasManyThrough'].includes(this.type)
    }

    isManyToMany() {
        return this.type == 'BelongsToMany'
    }

    isCommon(): boolean {
        return ['BelongsTo', 'HasMany', 'HasOne'].includes(this.type)
    }

    isCommonMorph() {
        return ['MorphOne', 'MorphMany'].includes(this.type)
    }

    isManyToManyMorph() {
        return ['MorphToMany'].includes(this.type)
    }

    isMorph() {
        return this.isCommonMorph() || this.isManyToManyMorph()
    }

    hasSchemaChanges(comparisonData: any): boolean {
        if(!this.schemaState) return true
        
        return this.hasDataChanges(comparisonData)
    }

    hasDataChanges(comparisonData: any): boolean {
        const dataComparisonMap = this.dataComparisonMap(comparisonData)

        return Object.keys(dataComparisonMap).some(key => dataComparisonMap[key])
    }

    dataComparisonMap(comparisonData: any) {
        return {
            name: DataComparator.stringsAreDifferent(this.schemaState.name, comparisonData.name),
            type: DataComparator.stringsAreDifferent(this.schemaState.type, comparisonData.type),
            relatedTableName: DataComparator.stringsAreDifferent(this.schemaState.relatedTableName, comparisonData.relatedTableName),
            relatedModelName: DataComparator.stringsAreDifferent(this.schemaState.relatedModelName, comparisonData.relatedModelName),
            parentTableName: DataComparator.stringsAreDifferent(this.schemaState.parentTableName, comparisonData.parentTableName),
            parentModelName: DataComparator.stringsAreDifferent(this.schemaState.parentModelName, comparisonData.parentModelName),
            relatedKeyName: DataComparator.stringsAreDifferent(this.schemaState.relatedKeyName, comparisonData.relatedKeyName),
            foreignKeyName: DataComparator.stringsAreDifferent(this.schemaState.foreignKeyName, comparisonData.foreignKeyName),
            ownerKeyName: DataComparator.stringsAreDifferent(this.schemaState.ownerKeyName, comparisonData.ownerKeyName),
            foreignPivotKeyName: DataComparator.stringsAreDifferent(this.schemaState.foreignPivotKeyName, comparisonData.foreignPivotKeyName),
            relatedPivotKeyName: DataComparator.stringsAreDifferent(this.schemaState.relatedPivotKeyName, comparisonData.relatedPivotKeyName),
            parentKeyName: DataComparator.stringsAreDifferent(this.schemaState.parentKeyName, comparisonData.parentKeyName),
            pivotTableName: DataComparator.stringsAreDifferent(this.schemaState.pivotTableName, comparisonData.pivotTableName),
            morphType: DataComparator.stringsAreDifferent(this.schemaState.morphType, comparisonData.morphType),
            localKeyName: DataComparator.stringsAreDifferent(this.schemaState.localKeyName, comparisonData.localKeyName),
            firstKeyName: DataComparator.stringsAreDifferent(this.schemaState.firstKeyName, comparisonData.firstKeyName),
            secondKeyName: DataComparator.stringsAreDifferent(this.schemaState.secondKeyName, comparisonData.secondKeyName),
        }
    }

    hasLocalChanges(): boolean {
        if(!this.schemaState) return false

        return this.hasDataChanges(this)
    }
    
    logDataComparison(): void {
        console.log('Showing changes for relationship ' + this.name)

        DataComparisonLogger.setInstance(this).log()
    }

    applyChanges(data: any) {
        if(!this.hasSchemaChanges(data)) return false

        this.name = data.name
        this.type = data.type
        this.relatedTableName = data.relatedTableName
        this.relatedModelName = data.relatedModelName
        this.parentTableName = data.parentTableName
        this.parentModelName = data.parentModelName
        this.foreignKeyName = data.foreignKeyName
        this.localKeyName = data.localKeyName
        this.ownerKeyName = data.ownerKeyName
        this.relatedKeyName = data.relatedKeyName
        this.morphType = data.morphType
        this.createdFromInterface = false

        this.foreignPivotKeyName = data.foreignPivotKeyName
        this.relatedPivotKeyName = data.relatedPivotKeyName
        this.pivotTableName = data.pivotTableName

        this.firstKeyName = data.firstKeyName
        this.secondKeyName = data.secondKeyName

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
            type: this.type,
            relatedTableName: this.relatedTableName,
            relatedModelName: this.relatedModelName,
            parentTableName: this.parentTableName,
            parentModelName: this.parentModelName,
            foreignKeyName: this.foreignKeyName,
            localKeyName: this.localKeyName,
            ownerKeyName: this.ownerKeyName,
            relatedKeyName: this.relatedKeyName,
            morphType: this.morphType,
            foreignPivotKeyName: this.foreignPivotKeyName,
            relatedPivotKeyName: this.relatedPivotKeyName,
            pivotTableName: this.pivotTableName,
            firstKeyName: this.firstKeyName,
            secondKeyName: this.secondKeyName,
        }
    }

    wasCreatedFromInterface(): boolean {
        return !! this.createdFromInterface
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

    getServiceFromType(): any {
        if(this.isCommon()) {
            return CalculateCommonRelationshipsData.setRelationship(this)
        }

        if(this.isManyToMany()) {
            return CalculateManyToManyRelationshipsData.setRelationship(this)
        }

        if(this.isMorph()) {
            return CalculateMorphRelationshipsData.setRelationship(this)
        }

        if(this.isThrough()) {
            return CalculateThroughRelationshipsData.setRelationship(this)
        }

        return null
    }

    fillRelationshipKeys(): void {
        if(this.isCommon()) {
            return FillCommonRelationshipKeys.fillRelationship(this)
        }
    }
}
