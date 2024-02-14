import Table from "@Common/models/Table"
import Project from "@Common/models/Project"

export type TablesOrders = { [tableId: string]: number }
export default class MigrationOrganizer {
    private project: Project

    static storedTablesOrders: TablesOrders = {}

    constructor(project: any) {
        this.project = project
    }

    static storeTablesOrders(project: Project) {
        const organizer = new MigrationOrganizer(project)
        MigrationOrganizer.storedTablesOrders = organizer.getTablesOrders()
    }

    static getStoredTablesOrders() {
        return MigrationOrganizer.storedTablesOrders
    }

    static clearStoredTablesOrders() {
        MigrationOrganizer.storedTablesOrders = {}
    }

    getTablesNames(): string[] {
        return this.handle().map(table => table.name)
    }

    getStoredOrderForTable(table: Table): number {
        if (MigrationOrganizer.storedTablesOrders[table.id]) {
            return MigrationOrganizer.storedTablesOrders[table.id]
        }

        return this.getOrderForTable(table)
    }

    getOrderForTable(table: Table): number {
        return this.handle().findIndex(t => t.name === table.name) + 1 || 1
    }

    getTablesOrders(): TablesOrders {
        return this.handle().reduce((acc, table, index) => {
            acc[table.id] = index + 1
            return acc
        }, {})
    }

    handle(): Table[] {
        const tablesWithChanges = this.project.getTablesWithChangesIncludingRemoved()
        const newTables = tablesWithChanges.filter(table => table.isNew()).sort(this.compareTables)
        const updatedTables = tablesWithChanges.filter(table => table.wasUpdated()).sort(this.compareTables)
        const removedTables = tablesWithChanges.filter(table => table.isRemoved()).sort(this.compareTables)

        // Concatenate new and updated tables, as new tables take precedence
        return [...newTables, ...updatedTables, ...removedTables]
    }

    private compareTables(a: Table, b: Table): number {
        // Check if one table is a child of the other
        if (a.isChildrenOf(b)) return 1
        if (b.isChildrenOf(a)) return -1

        // Prioritize tables that have dependent children
        if (a.hasChildrenTables() && !b.hasChildrenTables()) return -1
        if (!a.hasChildrenTables() && b.hasChildrenTables()) return 1

        // Maintain original order if no clear priority
        return 0
    }
}