import Project from "@Common/models/Project"
import Table from "@Common/models/Table"
import MigrationOrganizer, { TablesOrders } from "@Common/services/tables/MigrationOrganizer"

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
    protected addedTables: Table[] = []
    protected changedTables: Table[] = []
    protected removedTables: Table[] = []
    private changesCalculated: boolean = false

    constructor(project: Project) {
        this.project = project
    }

    getAddedTables(): Table[] {
        if (!this.changesCalculated) {
            this.calculate()
        }

        return this.addedTables
    }

    getChangedTables(): Table[] {
        if (!this.changesCalculated) {
            this.calculate()
        }

        return this.changedTables
    }

    getRemovedTables(): Table[] {
        if (!this.changesCalculated) {
            this.calculate()
        }

        return this.removedTables
    }

    hasChanges(): boolean {
        if (!this.changesCalculated) {
            this.calculate()
        }

        return this.addedTables.length > 0 
            || this.changedTables.length > 0 
            || this.removedTables.length > 0
    }

    hasAddedTables(): boolean {
        if (!this.changesCalculated) {
            this.calculate()
        }

        return this.addedTables.length > 0
    }

    hasChangedTables(): boolean {
        if (!this.changesCalculated) {
            this.calculate()
        }

        return this.changedTables.length > 0
    }

    hasRemovedTables(): boolean {
        if (!this.changesCalculated) {
            this.calculate()
        }

        return this.removedTables.length > 0
    }

    getAllTables(): Table[] {
        if (!this.changesCalculated) {
            this.calculate()
        }

        const allTables = [...this.addedTables, ...this.changedTables, ...this.removedTables]
        
        return allTables.filter((table, index, self) => {
            return self.findIndex(t => t.id === table.id) === index
        })
    }
    
    getAllChangesWithTable(ordered: boolean = false): { table: Table, type: SchemaTableChangeType }[] {
        if (!this.changesCalculated) {
            ordered ? this.calculateOrdered() : this.calculate()
        }

        const allChanges = [
            ...this.addedTables.map(table => ({ table, type: SchemaTableChangeType.Added })),
            ...this.changedTables.map(table => ({ table, type: SchemaTableChangeType.Changed })),
            ...this.removedTables.map(table => ({ table, type: SchemaTableChangeType.Removed })),
        ]

        return allChanges.filter((change, index, self) => { 
            return self.findIndex(c => c.table.id === change.table.id) === index
        })
    }

    calculateOrdered(): SchemaTablesChanges {
        if (!this.changesCalculated) {
            this.calculate()
        }

        const tablesOrders = new MigrationOrganizer(this.project).getTablesOrders()

        return {
            addedTables: this.sortTablesByMigrationOrder(tablesOrders, this.addedTables),
            changedTables: this.sortTablesByMigrationOrder(tablesOrders, this.changedTables),
            removedTables: this.sortTablesByMigrationOrder(tablesOrders, this.removedTables),
        }
    }

    calculate(): SchemaTablesChanges {
        if (this.changesCalculated) return {
            addedTables: this.addedTables,
            changedTables: this.changedTables,
            removedTables: this.removedTables,
        }

        this.addedTables = []
        this.changedTables = []
        this.removedTables = []

        for (const table of this.project.tables) {
            if (table.isNew()) {
                this.addedTables.push(table)
            } else if (table.isDirty()) {
                this.changedTables.push(table)
            } else if (table.isRemoved()) {
                this.removedTables.push(table)
            }
        }

        this.changesCalculated = true

        return {
            addedTables: this.addedTables,
            changedTables: this.changedTables,
            removedTables: this.removedTables,
        }
    }

    reset(): CalculateSchemaTablesChanges {
        this.addedTables = []
        this.changedTables = []
        this.removedTables = []
        this.changesCalculated = false

        return this
    }

    sortTablesByMigrationOrder(orders: TablesOrders, tables: Table[]): Table[] {
        return tables.sort((a, b) => {
            if (orders[a.id] < orders[b.id]) return -1
            if (orders[a.id] > orders[b.id]) return 1
            return 0
        })
    }
}
