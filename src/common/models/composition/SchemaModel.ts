interface SchemaModel {
    schemaState: any

    hasSchemaChanges(comparisonData: any): boolean
    hasDataChanges(comparisonData: any): boolean
    getDataComparison(): any
    dataComparisonMap(comparisonData: any): any
    hasLocalChanges(): boolean
    applyChanges(data: any): boolean
    saveSchemaState(): void
    fillSchemaState(): void
    buildSchemaState(): any
    isNew(): boolean
    wasRenamed(): boolean
    getOldName(): string
    getCanonicalName(): string
    isRemoved(): boolean
    undoChanges(): void    
    logDataComparison(): void
}