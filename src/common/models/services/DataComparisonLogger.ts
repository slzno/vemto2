class DataComparisonLogger {
    schemaState: any
    comparisonData: any
    dataComparisonMap: any
    completeSchemaState: any

    setInstance(instance: any) {
        const dataComparisonMap = instance.dataComparisonMap(instance)

        this.setSchemaState(instance.schemaState)
            .setComparisonData(instance)
            .setCompleteSchemaState(instance.buildSchemaState())
            .setDataComparisonMap(dataComparisonMap)

        return this
    }

    setComparisonData(comparisonData: any) {
        this.comparisonData = comparisonData

        return this
    }

    setSchemaState(schemaState: any) {
        this.schemaState = schemaState

        return this
    }

    setCompleteSchemaState(completeSchemaState: any) {
        this.completeSchemaState = completeSchemaState

        return this
    }

    setDataComparisonMap(dataComparisonMap: any) {
        this.dataComparisonMap = dataComparisonMap

        return this
    }

    log() {
        if(!this.schemaState) {
            console.log('No schema state set')
            return
        }

        let columns = []

        for(let key in this.completeSchemaState) {
            columns.push({
                "Key": key,
                "Schema": this.schemaState[key],
                "Data": this.comparisonData[key],
                "Are Different": this.schemaState[key] !== this.comparisonData[key],
                "DataComparator Diff": this.dataComparisonMap[key],
            })
        }

        console.table(columns)
    }
}

export default new DataComparisonLogger()