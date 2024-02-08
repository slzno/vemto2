import Table from "@Common/models/Table"
import Project from "@Common/models/Project"

export default class MigrationOrganizer {
    private project: Project

    constructor(project: any) {
        this.project = project
    }

    handle(): Table[] {
        const tablesWithChanges = this.project.getTablesWithChanges()
        const newTables = tablesWithChanges.filter(table => table.isNew()).sort(this.compareTables)
        const updatedTables = tablesWithChanges.filter(table => table.wasUpdated()).sort(this.compareTables)

        // Concatenate new and updated tables, as new tables take precedence
        return [...newTables, ...updatedTables]
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