import Project from "@Common/models/Project"
import Model from "@Common/models/Model"

interface SchemaModelsChanges {
    addedModels: Model[]
    changedModels: Model[]
    removedModels: Model[]
}

export enum SchemaModelChangeType {
    Added = "added",
    Changed = "changed",
    Removed = "removed",
}

export default class CalculateSchemaModelsChanges {

    protected project: Project
    private addedModels: Model[] = []
    private changedModels: Model[] = []
    private removedModels: Model[] = []
    private changesCalculated: boolean = false

    constructor(project: Project) {
        this.project = project
    }

    getAddedModels(): Model[] {
        if (!this.changesCalculated) {
            this.calculate()
        }

        return this.addedModels
    }

    getChangedModels(): Model[] {
        if (!this.changesCalculated) {
            this.calculate()
        }

        return this.changedModels
    }

    getRemovedModels(): Model[] {
        if (!this.changesCalculated) {
            this.calculate()
        }

        return this.removedModels
    }

    hasChanges(): boolean {
        if (!this.changesCalculated) {
            this.calculate()
        }

        return this.addedModels.length > 0 || this.changedModels.length > 0 || this.removedModels.length > 0
    }

    hasAddedModels(): boolean {
        if (!this.changesCalculated) {
            this.calculate()
        }

        return this.addedModels.length > 0
    }

    hasChangedModels(): boolean {
        if (!this.changesCalculated) {
            this.calculate()
        }

        return this.changedModels.length > 0
    }

    hasRemovedModels(): boolean {
        if (!this.changesCalculated) {
            this.calculate()
        }

        return this.removedModels.length > 0
    }

    getAllModels(): Model[] {
        if (!this.changesCalculated) {
            this.calculate()
        }

        const allModels = [...this.addedModels, ...this.changedModels, ...this.removedModels]

        return allModels.filter((model, index, self) => { 
            return self.findIndex(m => m.id === model.id) === index 
        })
    }

    getAllChangesWithModel(): { model: Model, type: SchemaModelChangeType }[] {
        if (!this.changesCalculated) {
            this.calculate()
        }

        const allChanges = [
            ...this.addedModels.map(model => ({ model, type: SchemaModelChangeType.Added })),
            ...this.changedModels.map(model => ({ model, type: SchemaModelChangeType.Changed })),
            ...this.removedModels.map(model => ({ model, type: SchemaModelChangeType.Removed })),
        ]

        return allChanges.filter((change, index, self) => { 
            return self.findIndex(c => c.model.id === change.model.id) === index 
        })
    }

    calculate(): SchemaModelsChanges {
        if (this.changesCalculated) return {
            addedModels: this.addedModels,
            changedModels: this.changedModels,
            removedModels: this.removedModels,
        }

        // Reset the arrays to ensure they're empty before starting the calculation
        this.addedModels = []
        this.changedModels = []
        this.removedModels = []

        for (const model of this.project.getValidModels()) {
            if (model.isNew()) {
                this.addedModels.push(model)
            } else if (model.isDirty()) {
                this.changedModels.push(model)
            } else if (model.isRemoved()) {
                this.removedModels.push(model)
            }
        }

        this.changesCalculated = true

        return {
            addedModels: this.addedModels,
            changedModels: this.changedModels,
            removedModels: this.removedModels,
        }
    }

    reset(): CalculateSchemaModelsChanges {
        this.addedModels = []
        this.changedModels = []
        this.removedModels = []
        this.changesCalculated = false

        return this
    }
}
