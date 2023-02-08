import Project from './Project'
import RelaDB from '@tiago_silva_pereira/reladb'

export default class Model extends RelaDB.Model {
    id: string
    name: string
    class: string
    path: string
    schemaState: any
    removed: boolean
    project: Project
    projectId: string
    createdFromInterface: boolean

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
            project: () => this.belongsTo(Project),
        }
    }

    saveFromInterface() {
        let creating = false

        if(!this.isSaved()) creating = true

        this.createdFromInterface = creating

        this.save()

        // this.markAsChanged()

        return this
    }

    remove() {
        if(this.isNew()) {
            return this.delete()
        }
        
        this.removed = true

        this.save()

        // this.markAsChanged()
    }

    getOldName(): string {
        if(!this.schemaState) return this.name

        return this.schemaState.name
    }

    hasSchemaChanges(comparisonData: any): boolean {
        return this.name !== comparisonData.name ||
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
}
