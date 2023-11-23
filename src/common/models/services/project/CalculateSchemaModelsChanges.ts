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

    constructor(project: Project) {
        this.project = project
    }

    getAddedModels(): Model[] {
        const { addedModels } = this.calculate()

        return addedModels
    }

    getChangedModels(): Model[] {
        const { changedModels } = this.calculate()

        return changedModels
    }

    getRemovedModels(): Model[] {
        const { removedModels } = this.calculate()

        return removedModels
    }

    hasChanges(): boolean {
        const { addedModels, changedModels, removedModels } = this.calculate()

        return addedModels.length > 0 || changedModels.length > 0 || removedModels.length > 0
    }

    hasAddedModels(): boolean {
        const { addedModels } = this.calculate()

        return addedModels.length > 0
    }

    hasChangedModels(): boolean {
        const { changedModels } = this.calculate()

        return changedModels.length > 0
    }

    hasRemovedModels(): boolean {
        const { removedModels } = this.calculate()

        return removedModels.length > 0
    }

    getAllModels(): Model[] {
        const { addedModels, changedModels, removedModels } = this.calculate()

        const allModels = [...addedModels, ...changedModels, ...removedModels]

        return allModels.filter((model, index, self) => {
            return self.findIndex(m => m.id === model.id) === index
        })
    }

    getAllChangesWithModel(): { model: Model, type: SchemaModelChangeType }[] {
        const { addedModels, changedModels, removedModels } = this.calculate()

        const allChanges = [
            ...addedModels.map(model => ({ model, type: SchemaModelChangeType.Added })),
            ...changedModels.map(model => ({ model, type: SchemaModelChangeType.Changed })),
            ...removedModels.map(model => ({ model, type: SchemaModelChangeType.Removed })),
        ]

        return allChanges.filter((change, index, self) => {
            return self.findIndex(c => c.model.id === change.model.id) === index
        })
    }

    calculate(): SchemaModelsChanges {
        const addedModels: Model[] = []
        const changedModels: Model[] = []
        const removedModels: Model[] = []

        for (const model of this.project.models) {
            if (model.isNew()) {
                addedModels.push(model)
            } else if (model.isDirty()) {
                changedModels.push(model)
            } else if (model.isRemoved()) {
                removedModels.push(model)
            }
        }

        return {
            addedModels,
            changedModels,
            removedModels,
        }
    }
}