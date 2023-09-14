import RelaDB from '@tiago_silva_pereira/reladb'

export default abstract class AbstractSchemaModel extends RelaDB.Model {

    static isSavingInternally = false

    static updating(newData: any, currentData: any): any {
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

}