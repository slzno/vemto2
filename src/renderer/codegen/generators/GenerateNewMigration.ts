import Table from "../../../common/models/Table"
import Project from "../../../common/models/Project"

export default new class GenerateNewMigration {
    table: Table
    project: Project

    setTable(table: Table) {
        this.table = table
        this.project = table.project
        
        return this
    }

    run() {
        
    }
}