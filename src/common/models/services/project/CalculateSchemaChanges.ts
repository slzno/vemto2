import Project from "@Common/models/Project"
import Table from "@Common/models/Table"

interface SchemaChanges {
    addedTables: Table[]
    changedTables: Table[]
    removedTables: Table[]
}

export default class CalculateSchemaChanges {
    protected project: Project

    constructor(project: Project) {
        this.project = project
    }

    getAddedTables(): Table[] {
        const { addedTables } = this.calculate()

        return addedTables
    }

    getChangedTables(): Table[] {
        const { changedTables } = this.calculate()

        return changedTables
    }

    getRemovedTables(): Table[] {
        const { removedTables } = this.calculate()

        return removedTables
    }

    hasChanges(): boolean {
        const { addedTables, changedTables, removedTables } = this.calculate()

        return addedTables.length > 0 || changedTables.length > 0 || removedTables.length > 0
    }

    hasAddedTables(): boolean {
        const { addedTables } = this.calculate()

        return addedTables.length > 0
    }

    hasChangedTables(): boolean {
        const { changedTables } = this.calculate()

        return changedTables.length > 0
    }

    hasRemovedTables(): boolean {
        const { removedTables } = this.calculate()

        return removedTables.length > 0
    }

    getAllTables(): Table[] {
        const { addedTables, changedTables, removedTables } = this.calculate()

        const allTables = [...addedTables, ...changedTables, ...removedTables]

        return allTables.filter((table, index, self) => {
            return self.findIndex(t => t.id === table.id) === index
        })
    }

    calculate(): SchemaChanges {
        const addedTables: Table[] = []
        const changedTables: Table[] = []
        const removedTables: Table[] = []

        for (const table of this.project.tables) {
            if (table.isNew()) {
                addedTables.push(table)
            } else if (table.isDirty()) {
                changedTables.push(table)
            } else if (table.isRemoved()) {
                removedTables.push(table)
            }
        }

        return {
            addedTables,
            changedTables,
            removedTables,
        }
    }
}