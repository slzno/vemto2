import Project from "@Common/models/Project"
import Table from "@Common/models/Table"
import MigrationOrganizer from "@Common/services/tables/MigrationOrganizer"

interface SchemaTablesChanges {
    addedTables: Table[]
    changedTables: Table[]
    removedTables: Table[]
}

export enum SchemaTableChangeType {
    Added = "added",
    Changed = "changed",
    Removed = "removed",
}

export default class CalculateSchemaTablesChanges {
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

    getAllChangesWithTable(): { table: Table, type: SchemaTableChangeType }[] {
        const { addedTables, changedTables, removedTables } = this.calculate()

        const allChanges = [
            ...addedTables.map(table => ({ table, type: SchemaTableChangeType.Added })),
            ...changedTables.map(table => ({ table, type: SchemaTableChangeType.Changed })),
            ...removedTables.map(table => ({ table, type: SchemaTableChangeType.Removed })),
        ]

        return allChanges.filter((change, index, self) => {
            return self.findIndex(c => c.table.id === change.table.id) === index
        })
    }

    calculate(): SchemaTablesChanges {
        let addedTables: Table[] = []
        let changedTables: Table[] = []
        let removedTables: Table[] = []

        for (const table of this.project.tables) {
            if (table.isNew()) {
                addedTables.push(table)
            } else if (table.isDirty()) {
                changedTables.push(table)
            } else if (table.isRemoved()) {
                removedTables.push(table)
            }
        }

        // addedTables = this.sortTablesByMigrationOrder(addedTables)

        return {
            addedTables,
            changedTables,
            removedTables,
        }
    }

    sortTablesByMigrationOrder(tables: Table[]): Table[] {
        const migrationOrganizer = new MigrationOrganizer(this.project)

        return tables.sort((a, b) => {
            const aOrder = migrationOrganizer.getOrderForTable(a)
            const bOrder = migrationOrganizer.getOrderForTable(b)

            return aOrder - bOrder
        })
    }
}