import Table from './Table'
import Project from './Project'
import Relationship from './Relationship'
import RelaDB from '@tiago_silva_pereira/reladb'
import RenderableFile from './RenderableFile'

export default class Model extends RelaDB.Model {
    id: string
    name: string
    path: string
    table: Table
    class: string
    tableId: string
    fileName: string
    schemaState: any
    removed: boolean
    project: Project
    tableName: string
    projectId: string
    createdFromInterface: boolean
    ownRelationships: Relationship[]
    relatedRelationships: Relationship[]

    /**
     * Laravel related properties
     */
    casts: any
    fillable: string[]
    dates: string[]
    hidden: string[]
    appends: string[]
    methods: string[]

    static identifier() {
        return 'Model'
    }

    relationships() {
        return {
            table: () => this.belongsTo(Table),
            project: () => this.belongsTo(Project),
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
        return this.name !== comparisonData.name ||
            this.fileName !== comparisonData.fileName ||
            this.tableName !== comparisonData.tableName ||
            this.class !== comparisonData.class ||
            this.path !== comparisonData.path ||
            this.casts !== comparisonData.casts ||
            this.fillable !== comparisonData.fillable ||
            this.dates !== comparisonData.dates ||
            this.hidden !== comparisonData.hidden ||
            this.appends !== comparisonData.appends ||
            this.methods !== comparisonData.methods
    }

    applyChanges(data: any) {
        if(!this.hasSchemaChanges(data)) return false

        this.name = data.name
        this.fileName = data.fileName
        this.tableName = data.tableName
        this.class = data.class
        this.path = data.path
        this.casts = data.casts
        this.fillable = data.fillable
        this.dates = data.dates
        this.hidden = data.hidden
        this.appends = data.appends
        this.methods = data.methods
        this.createdFromInterface = false

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
            path: this.path,
            casts: this.casts,
            fillable: this.fillable,
            dates: this.dates,
            hidden: this.hidden,
            appends: this.appends,
            methods: this.methods,
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
                model: RenderableFile.dataAsDependency(this),
            }
        )
    }
}
