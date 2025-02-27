import RelaDB from '@tiago_silva_pereira/reladb'

export default abstract class AbstractSchemaModel extends RelaDB.Model {

    name: string
    schemaState: any
    removed: boolean
    static isSavingInternally = false

    abstract buildSchemaState(): any

    static beforeUpdate(newData: any, currentData: any): any {
        if(!AbstractSchemaModel.isSavingInternally) {
            const modelClass = (this as any),
                nonTouchableProperties = modelClass.nonTouchableProperties().concat(['schemaState'])

            nonTouchableProperties.forEach((property: string) => {
                if(this.propertiesAreDifferent(newData[property], currentData[property])) {
                    throw new Error(`You can't change the ${property} of a ${modelClass.identifier()} model out of the Internal mode. Please enable the isSavingInternally mode.`)
                }
            })
        }

        return newData
    }

    getOldName(): string {
        if(!this.schemaState) return this.name

        return this.schemaState.name
    }

    getCanonicalName(): string {
        return this.schemaState.name || this.name
    }

    isNew(): boolean {
        return !this.schemaState
    }
    
    wasRenamed(): boolean {
        if(!this.schemaState) return false
        
        return this.schemaState.name !== this.name
    }

    wasUpdatedOrRemoved(): boolean {
        return this.wasUpdated() || this.isRemoved()
    }

    wasUpdated(): boolean {
        if(this.isNew()) return false

        return this.isDirty()
    }

    abstract isDirty(): boolean

    isRemoved(): boolean {
        return !! this.removed
    }

    markAsRemoved(): void {
        this.removed = true
        this.save()
    }

    markAsNotRemoved(): void {
        this.removed = false
        this.save()
    }

    undoChanges(): void {
        const modelClass = this.constructor as any,
            nonTouchableProperties = modelClass.nonTouchableProperties().concat(['schemaState'])
        
        Object.keys(this.getSchemaStateData()).forEach((key: string) => {
            if(nonTouchableProperties.includes(key)) return
            this[key] = this.schemaState[key]
        })

        if(this.isRemoved()) {
            this.removed = false
        }

        this.save()
    }

    getSchemaStateData(): any {
        return this.schemaState || {}
    }

    static savingInternally(): any {
        AbstractSchemaModel.isSavingInternally = true
    }

    static notSavingInternally(): any {
        AbstractSchemaModel.isSavingInternally = false
    }

    static propertiesAreDifferent(firstProperty: any, secondProperty: any): boolean {
        return JSON.stringify(firstProperty) != JSON.stringify(secondProperty)
    }

    saveInternally(): any {
        AbstractSchemaModel.savingInternally()

        this.save()

        AbstractSchemaModel.notSavingInternally()
    }

    applyChangesDirectlyToSchemaState(): void {
        const keys = Object.keys(this.buildSchemaState()),
            modelClass = this.constructor as any,    
            nonTouchableProperties = modelClass.nonTouchableProperties().concat(['schemaState'])

        if(!this.schemaState) {
            this.schemaState = {}
        }

        console.log('keys', keys)
        console.log('nonTouchableProperties', nonTouchableProperties)

        keys.forEach((key: string) => {
            if(nonTouchableProperties.includes(key)) return
            console.log(key, this[key])
            this.schemaState[key] = this[key]
        })

        this.saveInternally()
    }
}