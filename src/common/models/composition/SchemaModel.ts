interface SchemaModel {
    schemaState: any

    hasSchemaChanges(comparisonData: any): boolean
    hasDataChanges(comparisonData: any): boolean
    dataComparisonMap(comparisonData: any): any
    hasLocalChanges(): boolean
    applyChanges(data: any): boolean
    saveSchemaState(): void
    fillSchemaState(): void
    buildSchemaState(): any
    isNew(): boolean
    wasRenamed(): boolean
    isRemoved(): boolean
    undoChanges(): void    
    logDataComparison(): void
}