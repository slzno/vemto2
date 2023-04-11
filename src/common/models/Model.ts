import Table from './Table'
import Project from './Project'
import Factory from './Factory'
import ModelSuite from './ModelSuite'
import Relationship from './Relationship'
import RelaDB from '@tiago_silva_pereira/reladb'
import DataComparator from './services/DataComparator'
import DataComparisonLogger from './services/DataComparisonLogger'
import TableNameExceptions from './static/TableNameExceptions'
import WordManipulator from '@Common/util/WordManipulator'

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
    factories: Factory[]
    modelSuites: ModelSuite[]
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

    hasTimestamps: boolean
    hasHidden: boolean
    hasFillable: boolean

    static identifier() {
        return 'Model'
    }

    relationships() {
        return {
            table: () => this.belongsTo(Table),
            project: () => this.belongsTo(Project),
            factories: () => this.hasMany(Factory).cascadeDelete(),
            ownRelationships: () => this.hasMany(Relationship).cascadeDelete(),
            relatedRelationships: () => this.hasMany(Relationship, 'relatedModelId').cascadeDelete(),
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
            fileName: DataComparator.stringsAreDifferent(this.schemaState.fileName, comparisonData.fileName),
            tableName: DataComparator.stringsAreDifferent(this.schemaState.tableName, comparisonData.tableName),
            class: DataComparator.stringsAreDifferent(this.schemaState.class, comparisonData.class),
            path: DataComparator.stringsAreDifferent(this.schemaState.path, comparisonData.path),
            casts: DataComparator.objectsAreDifferent(this.schemaState.casts, comparisonData.casts),
            fillable: DataComparator.arraysAreDifferent(this.schemaState.fillable, comparisonData.fillable),
            dates: DataComparator.arraysAreDifferent(this.schemaState.dates, comparisonData.dates),
            hidden: DataComparator.arraysAreDifferent(this.schemaState.hidden, comparisonData.hidden),
            appends: DataComparator.arraysAreDifferent(this.schemaState.appends, comparisonData.appends),
            methods: DataComparator.arraysAreDifferent(this.schemaState.methods, comparisonData.methods),
            hasTimestamps: DataComparator.booleansAreDifferent(this.schemaState.hasTimestamps, comparisonData.hasTimestamps),
            hasHidden: DataComparator.booleansAreDifferent(this.schemaState.hasHidden, comparisonData.hasHidden),
            hasFillable: DataComparator.booleansAreDifferent(this.schemaState.hasFillable, comparisonData.hasFillable),
        }
    }

    hasLocalChanges(): boolean {
        if(!this.schemaState) return false

        return this.hasDataChanges(this)
    }

    logDataComparison(): void {
        console.log('Showing changes for model ' + this.name)

        DataComparisonLogger.setInstance(this).log()
    }

    applyChanges(data: any) {
        if(!this.hasSchemaChanges(data)) return false

        this.name = data.name
        this.fileName = data.fileName
        this.tableName = data.tableName
        this.class = data.class
        this.namespace = data.namespace
        this.path = data.path
        this.casts = data.casts
        this.fillable = data.fillable
        this.dates = data.dates
        this.hidden = data.hidden
        this.appends = data.appends
        this.methods = data.methods
        this.createdFromInterface = false
        this.hasTimestamps = data.hasTimestamps
        this.hasHidden = data.hasHidden
        this.hasFillable = data.hasFillable

        const table = this.project.findTableByName(data.tableName)
        
        if(table) {
            this.tableId = table.id
        }

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
            tableName: this.tableName,
            class: this.class,
            namespace: this.namespace,
            path: this.path,
            casts: this.casts,
            fillable: this.fillable,
            dates: this.dates,
            hidden: this.hidden,
            appends: this.appends,
            methods: this.methods,
            hasTimestamps: this.hasTimestamps,
            hasHidden: this.hasHidden,
            hasFillable: this.hasFillable,
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

    getRelationshipsNames(): string[] {
        return this.ownRelationships.map(relationship => relationship.name)
    }

    getAllRelationshipsKeyedByName(): { [key: string]: Relationship } {
        const relationships = {}

        this.ownRelationships.forEach(relationship => {
            relationships[relationship.name] = relationship
        })

        return relationships
    }

    getNamespace(): string {
        return this.class.split('\\').slice(0, -1).join('\\')
    }

    newRelationship(): Relationship {
        let relationship = new Relationship()
        relationship.modelId = this.id
        relationship.type = 'BelongsTo'
        relationship.save()

        return relationship
    }

    syncSourceCode() {
        const fileName = this.name + '.php'

        this.project.registerRenderableFile(
            'app/Models', 
            fileName,
            'models/Model.vemtl', 
            {
                model: this,
            }
        )

        this.syncRelationshipsSourceCode()
    }

    syncRelationshipsSourceCode() {
        this.factories.forEach(factory => factory.syncSourceCode())
    }

    calculateDataByName(): void {
        if(!this.name || !this.name.length) return

        const tableNameExceptions = TableNameExceptions.get()

        if(this.name in tableNameExceptions) {
            let tableNameException = tableNameExceptions[this.name]

            this.plural = tableNameException.plural
        }

        const modelNamePlural = WordManipulator.pluralize(this.name)

        if(this.name != modelNamePlural) {
            this.plural = modelNamePlural
            this.pluralAndSingularAreSame = false
        } else {
            this.plural = `All${modelNamePlural}`
            this.pluralAndSingularAreSame = true
        }

        this.class = `${this.namespace}\\${this.name}`
        this.fileName = `${this.name}.php`
    }
}
