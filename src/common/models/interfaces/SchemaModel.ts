interface SchemaModel {
    schemaState: any

    hasLocalChanges(): boolean
    hasSchemaChanges(comparisonData: any): boolean
    dataComparisonMap(comparisonData: any): any
    applyChanges(data: any): boolean
    saveSchemaState(): void
    fillSchemaState(): void
    buildSchemaState(): any
    isNew(): boolean    
    logDataComparison(): void

    // Optional methods
    hasDataChanges?(data: any): boolean
}