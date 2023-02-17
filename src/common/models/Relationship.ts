import Model from './Model'
import Project from './Project'
import RelaDB from '@tiago_silva_pereira/reladb'

export default class Relationship extends RelaDB.Model {
    id: string
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

    model: Model
    modelId: string
    relatedModel: Model
    relatedModelId: string
    
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
            relatedModel: () => this.belongsTo(Model, 'relatedModelId'),
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

    getOldName(): string {
        if(!this.schemaState) return this.name

        return this.schemaState.name
    }

    hasSchemaChanges(comparisonData: any): boolean {
        return this.name !== comparisonData.name ||
            this.type !== comparisonData.type ||
            this.relatedTableName !== comparisonData.relatedTableName ||
            this.relatedModelName !== comparisonData.relatedModelName ||
            this.parentTableName !== comparisonData.parentTableName ||
            this.parentModelName !== comparisonData.parentModelName ||
            this.foreignKeyName !== comparisonData.foreignKeyName ||
            this.localKeyName !== comparisonData.localKeyName ||
            this.ownerKeyName !== comparisonData.ownerKeyName ||
            this.relatedKeyName !== comparisonData.relatedKeyName ||
            this.morphType !== comparisonData.morphType
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
}
