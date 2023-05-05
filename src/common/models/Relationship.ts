import Model from './Model'
import Project from './Project'
import RelaDB from '@tiago_silva_pereira/reladb'
import DataComparator from './services/DataComparator'
import DataComparisonLogger from './services/DataComparisonLogger'
import WordManipulator from '@Common/util/WordManipulator'
import RelationshipTypes from './static/RelationshipTypes'
import Foreign from './Foreign'
import Column from './Column'

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
    foreignKeyName: string
    localKeyName: string
    ownerKeyName: string
    relatedKeyName: string
    morphType: string
    pivotTableName: string

    model: Model
    modelId: string
    relatedModel: Model
    relatedModelId: string

    inverseId: string
    inverse: Relationship

    foreignKeyId: string
    foreignKey: Column

    parentKeyId: string
    parentKey: Column
    
    /**
     * Default properties
    */
    schemaState: any
    removed: boolean
    project: Project
    projectId: string
    createdFromInterface: boolean

    static identifier() {
        return 'Model'
    }

    relationships() {
        return {
            model: () => this.belongsTo(Model),
            project: () => this.belongsTo(Project),
            inverse: () => this.belongsTo(Relationship, 'inverseId').atMostOne(),
            relatedModel: () => this.belongsTo(Model, 'relatedModelId'),
            foreignKey: () => this.belongsTo(Column, 'foreignKeyId'),
            parentKey: () => this.belongsTo(Column, 'parentKeyId'),
        }
    }

    saveFromInterface() {
        let creating = false

        if(!this.isSaved()) creating = true

        this.createdFromInterface = creating

        this.save()

        this.syncSourceCode()

        return this
    }

    remove() {
        if(this.isNew()) {
            return this.delete()
        }
        
        this.removed = true

        this.save()

        this.syncSourceCode()
    }

    static updated(relationship: Relationship) {
        relationship.updateInverse()
    }

    static deleting(relationship: Relationship) {
        if(relationship.foreignKey) {
            relationship.foreignKey.delete()
        }
    }

    updateInverse() {
        let inverse = this.inverse

        if(!inverse) return
        
        if(inverse.foreignKeyId === this.foreignKeyId 
            && inverse.parentKeyId === this.parentKeyId) {
            return
        }

        inverse.foreignKeyId = this.foreignKeyId
        inverse.parentKeyId = this.parentKeyId
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

    hasTypeAndRelatedModel(): boolean {
        return this.hasType() && this.hasRelatedModel()
    }

    calculateDefaultData(): void {
        this.calculateName()
        this.calculateParentKey()
        this.calculateForeignName()
    }

    calculateName(): string {
        const finalName = this.getFinalDefaultName()

        this.defaultName = finalName
        this.usingFirstDefaultName = finalName === this.getDefaultName()

        if(this.name) return

        this.name = finalName

        return this.name
    }

    processAndSave(createInverse: boolean = false): void {
        this.process(createInverse)
        this.saveAndFinish()
    }

    saveAndFinish(): void {
        this.saveFromInterface()
        this.addToInverseRelation()
    }

    addToInverseRelation(): void {
        let inverse = this.inverse.fresh()
        
        if(!inverse.inverseId) {
            inverse.inverseId = this.id
            inverse.save()
        }
    }

    process(createInverse: boolean = false): void {
        if(this.type !== 'BelongsTo' && createInverse) {
            this.createInverseRelationship()
        }

        this.addForeign()

        if(this.type === 'BelongsTo' && createInverse) {
            this.createInverseRelationship()
        }

        this.calculateKeys()
        this.calculateName()
    }

    calculateKeys() {
        this.calculateParentKey()
        this.calculateForeignKey()

        return this
    }

    calculateForeignKey() {
        let keys = this.getDefaultKeys()

        this.foreignKeyId = this.foreignKeyId || keys.foreignKey.id
    }

    addForeign(): Foreign {
        if(!(['BelongsTo'].includes(this.type))) return

        let foreignName = this.getOriginalForeignName()

        return this.model.addForeign(foreignName, this.relatedModel)
    }

    createInverseRelationship() {
        if(this.inverseId) return
        
        const newRelationship = new Relationship({
                modelId: this.relatedModelId,
                projectId: this.projectId,
                relatedModelId: this.modelId,
                type: RelationshipTypes.get()[this.type].inverse,
                foreignKeyName: this.foreignKeyName
            })

        newRelationship.process()

        const freeSimilarRelationship = this.relatedModel.getFreeSimilarRelationship(newRelationship)
        
        if(!freeSimilarRelationship) {
            newRelationship.save()
            this.inverseId = newRelationship.id
        } else {
            this.inverseId = freeSimilarRelationship.id
        }

        return true
    }

    calculateParentKey() {
        const keys = this.getDefaultKeys()

        this.parentKeyId = this.parentKeyId || keys.parentKey.id
    }

    getDefaultKeys() {
        let keys = {} as any,
            foreignName = this.getOriginalForeignName()

        if(['BelongsTo'].includes(this.type)) {
            keys.parentKey = this.relatedModel.getPrimaryKey()
            keys.foreignKey = this.model.getColumnByName(foreignName)
        }
        
        if(['HasMany', 'HasOne'].includes(this.type)) {
            keys.parentKey = this.model.getPrimaryKey()
            keys.foreignKey = this.relatedModel.getColumnByName(foreignName)
        }

        return keys
    }

    getOriginalForeignName() {
        return this.foreignKeyName || this.getDefaultForeignKeyName()
    }

    calculateForeignName() {
        this.foreignKeyName = this.getDefaultForeignKeyName()
    }

    getDefaultForeignKeyName() {
        return WordManipulator.snakeCase(this.getParentModel().name) + '_id'
    }

    getParentModel(): Model {
        if(['BelongsTo'].includes(this.type)) {
            return this.relatedModel
        }
        
        if(['HasMany', 'HasOne'].includes(this.type)) {
            return this.model
        }
    }

    getFinalDefaultName() {
        const name = this.getDefaultName(),
            nameCount = this.countRelationshipsWithSameName(name),
            hasSimilarNames = nameCount > 0

        return hasSimilarNames ? `${name}${nameCount + 1}` : name
    }

    countRelationshipsWithSameName(name: string): number {
        const allRelationships = this.model.ownRelationships,
            nameRegex = new RegExp(`(${name})([0-9])*`)

        const count = allRelationships
            .filter(rel => nameRegex.test(rel.name))
            .length

        return count
    }

    getDefaultName(): string {
        if(this.isSingular()) {
            return WordManipulator.camelCase(this.relatedModel.name)
        }
        
        if(this.isCollection()) {
            return WordManipulator.camelCase(this.relatedModel.plural)
        }

        return ''
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
            foreignKeyName: DataComparator.stringsAreDifferent(this.schemaState.foreignKeyName, comparisonData.foreignKeyName),
            localKeyName: DataComparator.stringsAreDifferent(this.schemaState.localKeyName, comparisonData.localKeyName),
            ownerKeyName: DataComparator.stringsAreDifferent(this.schemaState.ownerKeyName, comparisonData.ownerKeyName),
            relatedKeyName: DataComparator.stringsAreDifferent(this.schemaState.relatedKeyName, comparisonData.relatedKeyName),
            morphType: DataComparator.stringsAreDifferent(this.schemaState.morphType, comparisonData.morphType),
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

    syncSourceCode() {
        this.model.syncSourceCode()
        this.relatedModel.syncSourceCode()
    }

    hasDifferentForeignOrParentKey(): boolean {
        return false
    }

    hasDifferentParentKey(): boolean {
        return false
    }
}
